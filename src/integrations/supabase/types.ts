export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blockchain_transactions: {
        Row: {
          action: string
          block_number: number | null
          from_address: string
          hash: string
          id: string
          status: string
          timestamp: string | null
          to_address: string
        }
        Insert: {
          action: string
          block_number?: number | null
          from_address: string
          hash: string
          id?: string
          status: string
          timestamp?: string | null
          to_address: string
        }
        Update: {
          action?: string
          block_number?: number | null
          from_address?: string
          hash?: string
          id?: string
          status?: string
          timestamp?: string | null
          to_address?: string
        }
        Relationships: []
      }
      claims: {
        Row: {
          beneficiary_id: string
          claimed_at: string | null
          completed_at: string | null
          id: string
          latitude: number | null
          location_hash: string | null
          longitude: number | null
          quantity: number
          status: string
          stock_id: string
          transaction_hash: string | null
        }
        Insert: {
          beneficiary_id: string
          claimed_at?: string | null
          completed_at?: string | null
          id?: string
          latitude?: number | null
          location_hash?: string | null
          longitude?: number | null
          quantity: number
          status: string
          stock_id: string
          transaction_hash?: string | null
        }
        Update: {
          beneficiary_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          id?: string
          latitude?: number | null
          location_hash?: string | null
          longitude?: number | null
          quantity?: number
          status?: string
          stock_id?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stock_records"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_centers: {
        Row: {
          capacity: number
          contact_number: string
          created_at: string | null
          id: string
          in_charge: string
          latitude: number
          location: string
          longitude: number
          name: string
        }
        Insert: {
          capacity: number
          contact_number: string
          created_at?: string | null
          id?: string
          in_charge: string
          latitude: number
          location: string
          longitude: number
          name: string
        }
        Update: {
          capacity?: number
          contact_number?: string
          created_at?: string | null
          id?: string
          in_charge?: string
          latitude?: number
          location?: string
          longitude?: number
          name?: string
        }
        Relationships: []
      }
      ipfs_references: {
        Row: {
          cid: string
          created_at: string | null
          data_type: string
          id: string
          linked_transaction: string | null
        }
        Insert: {
          cid: string
          created_at?: string | null
          data_type: string
          id?: string
          linked_transaction?: string | null
        }
        Update: {
          cid?: string
          created_at?: string | null
          data_type?: string
          id?: string
          linked_transaction?: string | null
        }
        Relationships: []
      }
      stock_records: {
        Row: {
          distributor_id: string
          id: string
          item_name: string
          metadata_cid: string | null
          quantity: number
          transaction_hash: string | null
          uploaded_at: string | null
        }
        Insert: {
          distributor_id: string
          id?: string
          item_name: string
          metadata_cid?: string | null
          quantity: number
          transaction_hash?: string | null
          uploaded_at?: string | null
        }
        Update: {
          distributor_id?: string
          id?: string
          item_name?: string
          metadata_cid?: string | null
          quantity?: number
          transaction_hash?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_records_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          govt_id: string | null
          id: string
          name: string | null
          phone: string | null
          role: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          govt_id?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          govt_id?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: string
          wallet_address?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
