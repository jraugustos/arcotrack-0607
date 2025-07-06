export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      treinos: {
        Row: {
          id: string
          user_id: string
          data: string
          series: number
          flechas_por_serie: number
          distancia: number
          tem_objetivo: boolean
          objetivo: number | null
          pontuacao_total: number
          melhor_serie: number
          observacoes: string | null
          concluido: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: string
          series: number
          flechas_por_serie: number
          distancia: number
          tem_objetivo?: boolean
          objetivo?: number | null
          pontuacao_total?: number
          melhor_serie?: number
          observacoes?: string | null
          concluido?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: string
          series?: number
          flechas_por_serie?: number
          distancia?: number
          tem_objetivo?: boolean
          objetivo?: number | null
          pontuacao_total?: number
          melhor_serie?: number
          observacoes?: string | null
          concluido?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      series: {
        Row: {
          id: string
          treino_id: string
          numero_serie: number
          pontuacao: number
          created_at: string
        }
        Insert: {
          id?: string
          treino_id: string
          numero_serie: number
          pontuacao?: number
          created_at?: string
        }
        Update: {
          id?: string
          treino_id?: string
          numero_serie?: number
          pontuacao?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_treino_id_fkey"
            columns: ["treino_id"]
            referencedRelation: "treinos"
            referencedColumns: ["id"]
          }
        ]
      }
      flechas: {
        Row: {
          id: string
          serie_id: string
          valor: number
          x: number | null
          y: number | null
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          serie_id: string
          valor: number
          x?: number | null
          y?: number | null
          ordem: number
          created_at?: string
        }
        Update: {
          id?: string
          serie_id?: string
          valor?: number
          x?: number | null
          y?: number | null
          ordem?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flechas_serie_id_fkey"
            columns: ["serie_id"]
            referencedRelation: "series"
            referencedColumns: ["id"]
          }
        ]
      }
      autoavaliacoes: {
        Row: {
          id: string
          treino_id: string
          postura: number
          ancoragem: number
          alinhamento: number
          respiracao: number
          mira: number
          liberacao: number
          follow_through: number
          consistencia: number
          ritmo: number
          foco: number
          created_at: string
        }
        Insert: {
          id?: string
          treino_id: string
          postura?: number
          ancoragem?: number
          alinhamento?: number
          respiracao?: number
          mira?: number
          liberacao?: number
          follow_through?: number
          consistencia?: number
          ritmo?: number
          foco?: number
          created_at?: string
        }
        Update: {
          id?: string
          treino_id?: string
          postura?: number
          ancoragem?: number
          alinhamento?: number
          respiracao?: number
          mira?: number
          liberacao?: number
          follow_through?: number
          consistencia?: number
          ritmo?: number
          foco?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "autoavaliacoes_treino_id_fkey"
            columns: ["treino_id"]
            referencedRelation: "treinos"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Types para usar no frontend
export type Profile = Database['public']['Tables']['profiles']['Row']
export type TreinoDb = Database['public']['Tables']['treinos']['Row']
export type SerieDb = Database['public']['Tables']['series']['Row']
export type FlechaDb = Database['public']['Tables']['flechas']['Row']
export type AutoavaliacaoDb = Database['public']['Tables']['autoavaliacoes']['Row']

export type TreinoInsert = Database['public']['Tables']['treinos']['Insert']
export type SerieInsert = Database['public']['Tables']['series']['Insert']
export type FlechaInsert = Database['public']['Tables']['flechas']['Insert']
export type AutoavaliacaoInsert = Database['public']['Tables']['autoavaliacoes']['Insert']
