import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CaktoWebhookPayload {
  event: string;
  data: {
    id: string;
    status: 'pending' | 'approved' | 'paid' | 'cancelled' | 'refunded';
    amount: number;
    customer: {
      email: string;
      name: string;
    };
    metadata?: {
      user_id?: string;
      plan?: string;
    };
    created_at: string;
    updated_at: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar se é POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse do payload
    const payload: CaktoWebhookPayload = await req.json()
    
    console.log('Webhook recebido:', payload)

    // Verificar se é um evento de pagamento
    if (!payload.event || !payload.data) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar cliente Supabase com service role (admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Processar apenas pagamentos aprovados ou pagos
    if (payload.data.status === 'approved' || payload.data.status === 'paid') {
      const { data, metadata } = payload.data
      
      // Obter user_id do metadata ou buscar pelo email
      let userId = metadata?.user_id
      
      if (!userId) {
        // Buscar usuário pelo email
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (userError) {
          console.error('Erro ao buscar usuário:', userError)
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const user = userData.users.find(u => u.email === payload.data.customer.email)
        
        if (!user) {
          console.error('Usuário não encontrado com email:', payload.data.customer.email)
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        userId = user.id
      }

      // Determinar o plano baseado no valor ou metadata
      let plan = metadata?.plan || 'monthly'
      let planType: 'monthly' | 'yearly' = 'monthly'
      
      // Calcular data de expiração baseado no plano
      const paymentDate = new Date()
      const expiryDate = new Date()
      
      switch (plan) {
        case 'test_7days':
          expiryDate.setDate(expiryDate.getDate() + 7)
          break
        case 'monthly':
          expiryDate.setMonth(expiryDate.getMonth() + 1)
          break
        case 'quarterly':
          expiryDate.setMonth(expiryDate.getMonth() + 3)
          break
        case 'semiannual':
          expiryDate.setMonth(expiryDate.getMonth() + 6)
          planType = 'yearly'
          break
        default:
          expiryDate.setMonth(expiryDate.getMonth() + 1)
      }

      // Atualizar assinatura do usuário
      const { error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: 'active',
          is_trial: false,
          payment_id: payload.data.id,
          payment_date: paymentDate.toISOString(),
          expiry_date: expiryDate.toISOString(),
          plan: plan,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Erro ao atualizar assinatura:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update subscription', details: updateError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Assinatura ativada para usuário ${userId}`)

      // Enviar email de confirmação (opcional)
      // TODO: Implementar envio de email

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription activated',
          user_id: userId,
          plan: plan,
          expiry_date: expiryDate.toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Para outros status, apenas registrar
    console.log(`Pagamento com status ${payload.data.status} - não processado`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook received but not processed',
        status: payload.data.status 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
