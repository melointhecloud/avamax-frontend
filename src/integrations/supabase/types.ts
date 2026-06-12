export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          captado_comissao: number | null
          captado_exclusividade: boolean | null
          captado_prazo: number | null
          convertido: boolean | null
          created_at: string
          creditos_consumidos: number
          id: number
          input: Json
          resultado: Json
          satisfacao: number | null
          user_id: string
          valor_captado: number | null
        }
        Insert: {
          captado_comissao?: number | null
          captado_exclusividade?: boolean | null
          captado_prazo?: number | null
          convertido?: boolean | null
          created_at?: string
          creditos_consumidos?: number
          id?: number
          input: Json
          resultado: Json
          satisfacao?: number | null
          user_id: string
          valor_captado?: number | null
        }
        Update: {
          captado_comissao?: number | null
          captado_exclusividade?: boolean | null
          captado_prazo?: number | null
          convertido?: boolean | null
          created_at?: string
          creditos_consumidos?: number
          id?: number
          input?: Json
          resultado?: Json
          satisfacao?: number | null
          user_id?: string
          valor_captado?: number | null
        }
        Relationships: []
      }
      bairros_por_municipio: {
        Row: {
          bairro: string
          estado: string
          id: number
          municipio: string
        }
        Insert: {
          bairro: string
          estado: string
          id?: number
          municipio: string
        }
        Update: {
          bairro?: string
          estado?: string
          id?: number
          municipio?: string
        }
        Relationships: []
      }
      controle_sync_bairros: {
        Row: {
          atualizado_em: string | null
          id: number
          ultimo_imovel_id: number
        }
        Insert: {
          atualizado_em?: string | null
          id?: number
          ultimo_imovel_id?: number
        }
        Update: {
          atualizado_em?: string | null
          id?: number
          ultimo_imovel_id?: number
        }
        Relationships: []
      }
      delete_confirmations: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      document_seals: {
        Row: {
          broker_creci: string | null
          broker_email: string | null
          broker_name: string | null
          created_at: string
          document_hash: string
          document_type: string | null
          evaluation_id: number
          id: string
          ip_address: string | null
          sealed_at: string
          user_id: string
        }
        Insert: {
          broker_creci?: string | null
          broker_email?: string | null
          broker_name?: string | null
          created_at?: string
          document_hash: string
          document_type?: string | null
          evaluation_id: number
          id?: string
          ip_address?: string | null
          sealed_at?: string
          user_id: string
        }
        Update: {
          broker_creci?: string | null
          broker_email?: string | null
          broker_name?: string | null
          created_at?: string
          document_hash?: string
          document_type?: string | null
          evaluation_id?: number
          id?: string
          ip_address?: string | null
          sealed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_seals_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis: {
        Row: {
          Anunciante: string | null
          Bairro: string | null
          Banheiros: number | null
          caracteristicas: Json | null
          Categoria: string | null
          Condominio: string | null
          data_imovel_resgate: string | null
          data_verificada_disponivel: string | null
          Descricao: string | null
          disponivel: boolean | null
          embedding: string | null
          Estado: string | null
          id: number
          IPTU: string | null
          latitude: string | null
          Link: string | null
          longetude: string | null
          Metros: number | null
          Midia_Imovel: string | null
          Municipio: string | null
          origem_automacao: string | null
          Quartos: number | null
          Regiao: string | null
          Rua: string | null
          Suite: number | null
          Telefone_Anunciante: string | null
          Vagas: number | null
          Valor: string | null
          valores_anteriores: string | null
        }
        Insert: {
          Anunciante?: string | null
          Bairro?: string | null
          Banheiros?: number | null
          caracteristicas?: Json | null
          Categoria?: string | null
          Condominio?: string | null
          data_imovel_resgate?: string | null
          data_verificada_disponivel?: string | null
          Descricao?: string | null
          disponivel?: boolean | null
          embedding?: string | null
          Estado?: string | null
          id?: number
          IPTU?: string | null
          latitude?: string | null
          Link?: string | null
          longetude?: string | null
          Metros?: number | null
          Midia_Imovel?: string | null
          Municipio?: string | null
          origem_automacao?: string | null
          Quartos?: number | null
          Regiao?: string | null
          Rua?: string | null
          Suite?: number | null
          Telefone_Anunciante?: string | null
          Vagas?: number | null
          Valor?: string | null
          valores_anteriores?: string | null
        }
        Update: {
          Anunciante?: string | null
          Bairro?: string | null
          Banheiros?: number | null
          caracteristicas?: Json | null
          Categoria?: string | null
          Condominio?: string | null
          data_imovel_resgate?: string | null
          data_verificada_disponivel?: string | null
          Descricao?: string | null
          disponivel?: boolean | null
          embedding?: string | null
          Estado?: string | null
          id?: number
          IPTU?: string | null
          latitude?: string | null
          Link?: string | null
          longetude?: string | null
          Metros?: number | null
          Midia_Imovel?: string | null
          Municipio?: string | null
          origem_automacao?: string | null
          Quartos?: number | null
          Regiao?: string | null
          Rua?: string | null
          Suite?: number | null
          Telefone_Anunciante?: string | null
          Vagas?: number | null
          Valor?: string | null
          valores_anteriores?: string | null
        }
        Relationships: []
      }
      imoveis_aluguel: {
        Row: {
          Anunciante: string | null
          Bairro: string | null
          Banheiros: number | null
          caracteristicas: Json | null
          Categoria: string | null
          Condominio: string | null
          data_imovel_resgate: string | null
          data_verificada_disponivel: string | null
          Descricao: string | null
          disponivel: boolean | null
          Estado: string | null
          id: number
          IPTU: string | null
          latitude: string | null
          Link: string | null
          longetude: string | null
          Metros: number | null
          Midia_Imovel: string | null
          Municipio: string | null
          origem_automacao: string | null
          Quartos: number | null
          Regiao: string | null
          Rua: string | null
          Suite: number | null
          Telefone_Anunciante: string | null
          Vagas: number | null
          Valor: string | null
          valores_anteriores: string | null
        }
        Insert: {
          Anunciante?: string | null
          Bairro?: string | null
          Banheiros?: number | null
          caracteristicas?: Json | null
          Categoria?: string | null
          Condominio?: string | null
          data_imovel_resgate?: string | null
          data_verificada_disponivel?: string | null
          Descricao?: string | null
          disponivel?: boolean | null
          Estado?: string | null
          id?: number
          IPTU?: string | null
          latitude?: string | null
          Link?: string | null
          longetude?: string | null
          Metros?: number | null
          Midia_Imovel?: string | null
          Municipio?: string | null
          origem_automacao?: string | null
          Quartos?: number | null
          Regiao?: string | null
          Rua?: string | null
          Suite?: number | null
          Telefone_Anunciante?: string | null
          Vagas?: number | null
          Valor?: string | null
          valores_anteriores?: string | null
        }
        Update: {
          Anunciante?: string | null
          Bairro?: string | null
          Banheiros?: number | null
          caracteristicas?: Json | null
          Categoria?: string | null
          Condominio?: string | null
          data_imovel_resgate?: string | null
          data_verificada_disponivel?: string | null
          Descricao?: string | null
          disponivel?: boolean | null
          Estado?: string | null
          id?: number
          IPTU?: string | null
          latitude?: string | null
          Link?: string | null
          longetude?: string | null
          Metros?: number | null
          Midia_Imovel?: string | null
          Municipio?: string | null
          origem_automacao?: string | null
          Quartos?: number | null
          Regiao?: string | null
          Rua?: string | null
          Suite?: number | null
          Telefone_Anunciante?: string | null
          Vagas?: number | null
          Valor?: string | null
          valores_anteriores?: string | null
        }
        Relationships: []
      }
      leads_enterprise: {
        Row: {
          company_name: string
          contact_name: string
          created_at: string | null
          email: string
          id: string
          phone: string | null
        }
        Insert: {
          company_name: string
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          phone?: string | null
        }
        Update: {
          company_name?: string
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      ligacoes: {
        Row: {
          created_at: string
          id: string
          imovel_id: number
          origem: string
          telefone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          imovel_id: number
          origem?: string
          telefone: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          imovel_id?: number
          origem?: string
          telefone?: string
          user_id?: string
        }
        Relationships: []
      }
      noticias: {
        Row: {
          created_at: string
          data_noticia: string | null
          descricao: string | null
          id: number
          image: string | null
          link: string | null
          titulo: string | null
        }
        Insert: {
          created_at?: string
          data_noticia?: string | null
          descricao?: string | null
          id?: number
          image?: string | null
          link?: string | null
          titulo?: string | null
        }
        Update: {
          created_at?: string
          data_noticia?: string | null
          descricao?: string | null
          id?: number
          image?: string | null
          link?: string | null
          titulo?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_data: Json | null
          created_at: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_data?: Json | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pesquisas_satisfacao: {
        Row: {
          aceitou_google: boolean | null
          comentario: string | null
          created_at: string | null
          creditos_recebidos: number | null
          id: string
          ideias_melhoria: string | null
          nota: number
          user_id: string
        }
        Insert: {
          aceitou_google?: boolean | null
          comentario?: string | null
          created_at?: string | null
          creditos_recebidos?: number | null
          id?: string
          ideias_melhoria?: string | null
          nota: number
          user_id: string
        }
        Update: {
          aceitou_google?: boolean | null
          comentario?: string | null
          created_at?: string | null
          creditos_recebidos?: number | null
          id?: string
          ideias_melhoria?: string | null
          nota?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          creci: string | null
          credits: number | null
          email: string | null
          id: string
          imobiliaria: string | null
          is_ceo: boolean | null
          logo_imobiliaria_url: string | null
          mfr_id: string | null
          nome: string | null
          organization: string | null
          plano: string | null
          remax_franchise_id: string | null
          remax_onboarding_complete: boolean
          signature_url: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          creci?: string | null
          credits?: number | null
          email?: string | null
          id: string
          imobiliaria?: string | null
          is_ceo?: boolean | null
          logo_imobiliaria_url?: string | null
          mfr_id?: string | null
          nome?: string | null
          organization?: string | null
          plano?: string | null
          remax_franchise_id?: string | null
          remax_onboarding_complete?: boolean
          signature_url?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          creci?: string | null
          credits?: number | null
          email?: string | null
          id?: string
          imobiliaria?: string | null
          is_ceo?: boolean | null
          logo_imobiliaria_url?: string | null
          mfr_id?: string | null
          nome?: string | null
          organization?: string | null
          plano?: string | null
          remax_franchise_id?: string | null
          remax_onboarding_complete?: boolean
          signature_url?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_mfr_id_fkey"
            columns: ["mfr_id"]
            isOneToOne: false
            referencedRelation: "remax_mfrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_remax_franchise_id_fkey"
            columns: ["remax_franchise_id"]
            isOneToOne: false
            referencedRelation: "remax_franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      remax_franchises: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          id: string
          mfr_id: string
          name: string
          team_id: string | null
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          id?: string
          mfr_id: string
          name: string
          team_id?: string | null
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          id?: string
          mfr_id?: string
          name?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remax_franchises_mfr_id_fkey"
            columns: ["mfr_id"]
            isOneToOne: false
            referencedRelation: "remax_mfrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remax_franchises_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      remax_join_requests: {
        Row: {
          created_at: string
          franchise_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          franchise_id: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          franchise_id?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remax_join_requests_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "remax_franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remax_join_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      remax_mfrs: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          plan: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          plan?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          plan?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_achievements: {
        Row: {
          achievement_id: string
          id: string
          progress: Json | null
          team_id: string
          unlocked_at: string | null
        }
        Insert: {
          achievement_id: string
          id?: string
          progress?: Json | null
          team_id: string
          unlocked_at?: string | null
        }
        Update: {
          achievement_id?: string
          id?: string
          progress?: Json | null
          team_id?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_achievements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_credit_transfers: {
        Row: {
          amount: number
          created_at: string
          from_user_id: string | null
          id: string
          note: string | null
          team_id: string
          to_user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          from_user_id?: string | null
          id?: string
          note?: string | null
          team_id: string
          to_user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          from_user_id?: string | null
          id?: string
          note?: string | null
          team_id?: string
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_credit_transfers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_events: {
        Row: {
          assigned_to: string | null
          color: string | null
          created_at: string | null
          created_by: string
          description: string | null
          end_at: string
          id: string
          image_url: string | null
          mfr_id: string | null
          scope: string
          start_at: string
          team_id: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          color?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_at: string
          id?: string
          image_url?: string | null
          mfr_id?: string | null
          scope?: string
          start_at: string
          team_id: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_at?: string
          id?: string
          image_url?: string | null
          mfr_id?: string | null
          scope?: string
          start_at?: string
          team_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_events_mfr_id_fkey"
            columns: ["mfr_id"]
            isOneToOne: false
            referencedRelation: "remax_mfrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          is_over_limit: boolean | null
          status: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          is_over_limit?: boolean | null
          status?: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          is_over_limit?: boolean | null
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_goals: {
        Row: {
          created_at: string | null
          created_by: string
          goal: number
          id: string
          month: string
          team_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          goal: number
          id?: string
          month: string
          team_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          goal?: number
          id?: string
          month?: string
          team_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_goals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          allocated_credits: number
          created_at: string | null
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          allocated_credits?: number
          created_at?: string | null
          role: string
          team_id: string
          user_id: string
        }
        Update: {
          allocated_credits?: number
          created_at?: string | null
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          credits_viewed: boolean | null
          first_evaluation_done: boolean | null
          first_member_invited: boolean | null
          profile_configured: boolean | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          credits_viewed?: boolean | null
          first_evaluation_done?: boolean | null
          first_member_invited?: boolean | null
          profile_configured?: boolean | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          credits_viewed?: boolean | null
          first_evaluation_done?: boolean | null
          first_member_invited?: boolean | null
          profile_configured?: boolean | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_onboarding_progress_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          credit_balance: number
          id: string
          monthly_credits: number
          name: string
          owner_id: string
          plan: string
          seat_limit: number
        }
        Insert: {
          created_at?: string | null
          credit_balance?: number
          id?: string
          monthly_credits: number
          name: string
          owner_id: string
          plan: string
          seat_limit: number
        }
        Update: {
          created_at?: string | null
          credit_balance?: number
          id?: string
          monthly_credits?: number
          name?: string
          owner_id?: string
          plan?: string
          seat_limit?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          progress: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          progress?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          progress?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          credit_notifications: boolean
          email_notifications: boolean
          evaluation_notifications: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_notifications?: boolean
          email_notifications?: boolean
          evaluation_notifications?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_notifications?: boolean
          email_notifications?: boolean
          evaluation_notifications?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_member_credits: {
        Args: { p_amount: number; p_team_id: string; p_user_id: string }
        Returns: Json
      }
      adjust_member_credits: {
        Args: { p_amount: number; p_team_id: string; p_user_id: string }
        Returns: Json
      }
      approve_remax_join_request: {
        Args: { p_request_id: string }
        Returns: Json
      }
      atualizar_bairros_por_municipio: { Args: never; Returns: undefined }
      busca_knn_imoveis: {
        Args: {
          match_bairro: string
          match_count: number
          match_estado: string
          match_municipio: string
          match_threshold: number
          target_embedding: string
        }
        Returns: {
          Bairro: string
          Categoria: string
          distancia: number
          Estado: string
          id: number
          Link: string
          Metros: number
          Midia_Imovel: string
          Municipio: string
          Valor: string
        }[]
      }
      buscar_imoveis_palavras_chave: {
        Args: { p_municipio: string }
        Returns: {
          Descricao: string
          id: number
          Municipio: string
        }[]
      }
      buscar_imoveis_para_compra: {
        Args: {
          p_area?: number
          p_bairro: string
          p_banheiros?: number
          p_categoria?: string
          p_estado: string
          p_limit?: number
          p_municipio: string
          p_quartos?: number
          p_vagas?: number
        }
        Returns: {
          Anunciante: string
          Bairro: string
          Banheiros: number
          Categoria: string
          Descricao: string
          disponivel: boolean
          id: number
          Metros: number
          Midia_Imovel: string
          Quartos: number
          Rua: string
          score: number
          Suite: number
          Vagas: number
          Valor: string
          valores_anteriores: string
        }[]
      }
      buscar_imoveis_por_tipo: {
        Args: { p_municipio: string; p_tipo: string }
        Returns: {
          Descricao: string
          id: number
          Municipio: string
          tipo_detectado: string
        }[]
      }
      buscar_imoveis_similares: {
        Args: {
          p_area: number
          p_bairro: string
          p_banheiros: number
          p_categoria: string
          p_estado: string
          p_limit: number
          p_municipio: string
          p_quartos: number
          p_vagas: number
        }
        Returns: {
          Bairro: string
          Banheiros: number
          Categoria: string
          Descricao: string
          id: number
          Metros: string
          Midia_Imovel: string
          Quartos: number
          Rua: string
          score: number
          Vagas: number
          Valor: string
        }[]
      }
      buscar_imoveis_similares_duplicate: {
        Args: {
          p_area: number
          p_bairro: string
          p_banheiros: number
          p_categoria: string
          p_estado: string
          p_limit: number
          p_municipio: string
          p_quartos: number
          p_vagas: number
        }
        Returns: {
          Bairro: string
          Banheiros: number
          Categoria: string
          Descricao: string
          id: number
          Metros: string
          Midia_Imovel: string
          Quartos: number
          Rua: string
          score: number
          Vagas: number
          Valor: string
        }[]
      }
      buscar_imoveis_similares_funcional: {
        Args: {
          p_area: number
          p_bairro: string
          p_banheiros: number
          p_categoria: string
          p_estado: string
          p_limit: number
          p_municipio: string
          p_quartos: number
          p_vagas: number
        }
        Returns: {
          Banheiros: number
          Categoria: string
          Descricao: string
          id: number
          Metros: number
          Midia_Imovel: string
          Quartos: number
          score: number
          Vagas: number
          Valor: string
        }[]
      }
      can_view_evaluation: {
        Args: { evaluation_user_id: string }
        Returns: boolean
      }
      consumir_credito: { Args: { p_user_id: string }; Returns: Json }
      delete_imoveis_batch: {
        Args: { p_estado: string; p_municipio: string; p_regiao: string }
        Returns: number
      }
      delete_imoveis_por_localizacao: {
        Args: { p_estado: string; p_municipio: string; p_regiao: string }
        Returns: undefined
      }
      get_ceo_agenda_events: {
        Args: { p_month_end: string; p_month_start: string }
        Returns: {
          assigned_to: string
          color: string
          created_at: string
          created_by: string
          description: string
          end_at: string
          id: string
          mfr_id: string
          scope: string
          start_at: string
          team_id: string
          title: string
        }[]
      }
      get_evaluation_cities: { Args: never; Returns: Json }
      get_evaluations_by_location: {
        Args: {
          p_bairro: string
          p_estado: string
          p_municipio: string
          p_user_id: string
        }
        Returns: {
          author_avatar: string
          author_name: string
          created_at: string
          eval_id: number
          eval_user_id: string
          input: Json
          resultado: Json
        }[]
      }
      get_links_disponiveis_7dias_ou_mais: {
        Args: { p_cursor?: string; p_limit?: number }
        Returns: {
          data_verificada_disponivel: string
          id: number
          link: string
        }[]
      }
      get_member_analytics: {
        Args: { p_member_id: string; p_period?: string; p_team_id: string }
        Returns: Json
      }
      get_mfr_agency_rankings: {
        Args: { p_mfr_id: string; p_type?: string }
        Returns: Json
      }
      get_mfr_dashboard_stats:
        | { Args: { p_mfr_id: string }; Returns: Json }
        | { Args: { p_mfr_id: string; p_period?: string }; Returns: Json }
      get_mfr_evaluation_locations: {
        Args: { p_mfr_id: string }
        Returns: {
          bairro: string
          estado: string
          eval_count: number
          municipio: string
        }[]
      }
      get_mfr_franchises_overview: { Args: { p_mfr_id: string }; Returns: Json }
      get_mfr_rankings: {
        Args: { p_mfr_id: string; p_type?: string }
        Returns: Json
      }
      get_my_profile: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          creci: string
          credits: number
          email: string
          id: string
          imobiliaria: string
          nome: string
          plano: string
          telefone: string
          updated_at: string
        }[]
      }
      get_network_leaderboard: { Args: { p_limit?: number }; Returns: Json }
      get_remax_join_requests: { Args: { p_team_id: string }; Returns: Json }
      get_team_achievement_stats: { Args: { p_team_id: string }; Returns: Json }
      get_team_analytics: {
        Args: { p_period?: string; p_team_id: string }
        Returns: Json
      }
      get_team_credit_pool: { Args: { p_team_id: string }; Returns: Json }
      get_team_credits_data: { Args: { p_team_id: string }; Returns: Json }
      get_team_dashboard_stats: {
        Args: { p_period?: string; p_team_id: string }
        Returns: Json
      }
      get_team_evaluation_locations: {
        Args: { p_user_id: string }
        Returns: {
          bairro: string
          estado: string
          eval_count: number
          municipio: string
        }[]
      }
      get_team_evaluations: {
        Args: {
          p_limit?: number
          p_scope?: string
          p_team_id: string
          p_user_id?: string
        }
        Returns: Json
      }
      get_team_goals_overview: {
        Args: { p_month?: string; p_team_id: string }
        Returns: Json
      }
      get_team_members_with_profiles: {
        Args: { p_team_id: string }
        Returns: {
          allocated_credits: number
          avatar_url: string
          created_at: string
          email: string
          is_owner: boolean
          nome: string
          role: string
          user_id: string
        }[]
      }
      get_team_onboarding_status: { Args: { p_team_id: string }; Returns: Json }
      get_user_achievement_stats: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      get_user_available_credits: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      get_user_goal_progress: { Args: { p_month?: string }; Returns: Json }
      get_user_team_id: { Args: { _user_id: string }; Returns: string }
      has_team_plan: { Args: { _user_id: string }; Returns: boolean }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_owner: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      limpar_links_duplicados: { Args: { p_limit?: number }; Returns: number }
      reject_remax_join_request: {
        Args: { p_request_id: string }
        Returns: Json
      }
      rpc_atualizar_data_resgate_mes_passado: {
        Args: { p_municipio: string }
        Returns: number
      }
      rpc_buscar_imovel_por_link: {
        Args: { p_link: string; p_municipio: string }
        Returns: {
          Anunciante: string | null
          Bairro: string | null
          Banheiros: number | null
          caracteristicas: Json | null
          Categoria: string | null
          Condominio: string | null
          data_imovel_resgate: string | null
          data_verificada_disponivel: string | null
          Descricao: string | null
          disponivel: boolean | null
          embedding: string | null
          Estado: string | null
          id: number
          IPTU: string | null
          latitude: string | null
          Link: string | null
          longetude: string | null
          Metros: number | null
          Midia_Imovel: string | null
          Municipio: string | null
          origem_automacao: string | null
          Quartos: number | null
          Regiao: string | null
          Rua: string | null
          Suite: number | null
          Telefone_Anunciante: string | null
          Vagas: number | null
          Valor: string | null
          valores_anteriores: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "imoveis"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      submit_survey_with_reward: {
        Args: {
          p_aceitou_google?: boolean
          p_comentario?: string
          p_ideias_melhoria?: string
          p_nota: number
        }
        Returns: Json
      }
      transfer_team_credits: {
        Args: { p_amount: number; p_team_id: string; p_to_user_id: string }
        Returns: Json
      }
      unlock_team_achievement: {
        Args: { p_achievement_id: string; p_progress?: Json; p_team_id: string }
        Returns: boolean
      }
      unlock_user_achievement: {
        Args: { p_achievement_id: string; p_progress?: Json }
        Returns: boolean
      }
      update_my_profile:
        | {
            Args: {
              p_avatar_url?: string
              p_creci?: string
              p_imobiliaria?: string
              p_nome?: string
              p_telefone?: string
            }
            Returns: boolean
          }
        | {
            Args: {
              p_avatar_url?: string
              p_creci?: string
              p_imobiliaria?: string
              p_logo_imobiliaria_url?: string
              p_nome?: string
              p_signature_url?: string
              p_telefone?: string
            }
            Returns: boolean
          }
      update_team_onboarding: {
        Args: { p_step: string; p_team_id: string }
        Returns: boolean
      }
      upsert_member_goal: {
        Args: {
          p_goal: number
          p_month?: string
          p_team_id: string
          p_user_id: string
        }
        Returns: Json
      }
      verify_document_seal: {
        Args: { p_document_hash: string }
        Returns: {
          document_type: string
          evaluation_id: number
          is_valid: boolean
          sealed_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
