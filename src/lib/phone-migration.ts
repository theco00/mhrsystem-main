/**
 * Utilitário para migração e formatação de números de telefone
 * Limpa números existentes no banco de dados
 */

import { supabase } from '@/integrations/supabase/client';
import { cleanPhone, isValidPhone } from './whatsapp-utils';

/**
 * Formata todos os telefones no banco de dados
 * Remove caracteres especiais e mantém apenas números
 */
export async function migratePhoneNumbers(): Promise<{
  success: boolean;
  updated: number;
  errors: number;
  message: string;
}> {
  try {
    console.log('🔄 Iniciando migração de telefones...');

    // 1. Buscar todos os clientes com telefone
    const { data: clients, error: fetchError } = await supabase
      .from('clients')
      .select('id, name, phone')
      .not('phone', 'is', null)
      .neq('phone', '');

    if (fetchError) {
      console.error('❌ Erro ao buscar clientes:', fetchError);
      return {
        success: false,
        updated: 0,
        errors: 1,
        message: `Erro ao buscar clientes: ${fetchError.message}`,
      };
    }

    if (!clients || clients.length === 0) {
      console.log('ℹ️ Nenhum cliente com telefone encontrado');
      return {
        success: true,
        updated: 0,
        errors: 0,
        message: 'Nenhum cliente com telefone para processar',
      };
    }

    console.log(`📱 Encontrados ${clients.length} clientes com telefone`);

    let updated = 0;
    let errors = 0;

    // 2. Processar cada cliente
    for (const client of clients) {
      const originalPhone = client.phone;
      const cleanedPhone = cleanPhone(originalPhone);

      // Só atualiza se o telefone mudou
      if (cleanedPhone !== originalPhone) {
        console.log(`🔧 Formatando: ${client.name} - "${originalPhone}" → "${cleanedPhone}"`);

        const { error } = await supabase
          .from('clients')
          .update({ phone: cleanedPhone })
          .eq('id', client.id);

        if (error) {
          console.error(`❌ Erro ao atualizar ${client.name}:`, error);
          errors++;
        } else {
          updated++;
        }
      }
    }

    console.log(`✅ Migração concluída: ${updated} atualizados, ${errors} erros`);

    return {
      success: errors === 0,
      updated,
      errors,
      message: `Formatação concluída: ${updated} telefones atualizados${errors > 0 ? `, ${errors} erros` : ''}`,
    };
  } catch (error: any) {
    console.error('❌ Erro na migração:', error);
    return {
      success: false,
      updated: 0,
      errors: 1,
      message: `Erro na migração: ${error.message}`,
    };
  }
}

/**
 * Valida e retorna estatísticas dos telefones no banco
 */
export async function getPhoneStatistics(): Promise<{
  total: number;
  withPhone: number;
  valid: number;
  invalid: number;
  details: {
    tooShort: number;
    tooLong: number;
    needsCleaning: number;
  };
}> {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('phone');

    if (error) throw error;

    const stats = {
      total: clients?.length || 0,
      withPhone: 0,
      valid: 0,
      invalid: 0,
      details: {
        tooShort: 0,
        tooLong: 0,
        needsCleaning: 0,
      },
    };

    clients?.forEach((client) => {
      if (client.phone && client.phone.trim() !== '') {
        stats.withPhone++;

        const cleaned = cleanPhone(client.phone);
        
        // Verifica se precisa de limpeza
        if (cleaned !== client.phone) {
          stats.details.needsCleaning++;
        }

        // Valida o telefone limpo
        if (isValidPhone(client.phone)) {
          stats.valid++;
        } else {
          stats.invalid++;
          
          if (cleaned.length < 10) {
            stats.details.tooShort++;
          } else if (cleaned.length > 11) {
            stats.details.tooLong++;
          }
        }
      }
    });

    return stats;
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      total: 0,
      withPhone: 0,
      valid: 0,
      invalid: 0,
      details: {
        tooShort: 0,
        tooLong: 0,
        needsCleaning: 0,
      },
    };
  }
}

/**
 * Formata um telefone específico no banco
 */
export async function formatClientPhone(clientId: string): Promise<boolean> {
  try {
    // Buscar telefone atual
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('phone')
      .eq('id', clientId)
      .single();

    if (fetchError || !client?.phone) {
      return false;
    }

    // Limpar telefone
    const cleanedPhone = cleanPhone(client.phone);

    // Atualizar se mudou
    if (cleanedPhone !== client.phone) {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ phone: cleanedPhone })
        .eq('id', clientId);

      return !updateError;
    }

    return true;
  } catch (error) {
    console.error('Erro ao formatar telefone:', error);
    return false;
  }
}
