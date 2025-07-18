export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      collective_agreements: {
        Row: {
          base_salary_max: number | null
          base_salary_min: number | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          social_charge_rate: number | null
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          base_salary_max?: number | null
          base_salary_min?: number | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          social_charge_rate?: number | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          base_salary_max?: number | null
          base_salary_min?: number | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          social_charge_rate?: number | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_info: {
        Row: {
          address: string | null
          company_name: string
          created_at: string
          email: string | null
          id: string
          phone: string | null
          siret: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          siret?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          siret?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_info_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          base_salary: number
          collective_agreement_id: string | null
          created_at: string | null
          department: string | null
          email: string
          employee_number: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          phone: string | null
          position: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          base_salary: number
          collective_agreement_id?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          employee_number: string
          first_name: string
          hire_date: string
          id?: string
          last_name: string
          phone?: string | null
          position: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          base_salary?: number
          collective_agreement_id?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          employee_number?: string
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          phone?: string | null
          position?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_collective_agreement_id_fkey"
            columns: ["collective_agreement_id"]
            isOneToOne: false
            referencedRelation: "collective_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      pay_slips: {
        Row: {
          calculation_id: string | null
          created_at: string | null
          employee_id: string
          generated_at: string | null
          gross_salary: number
          id: string
          net_salary: number
          period_id: string
          social_charges: number
          status: string | null
          tax_charges: number
          updated_at: string | null
        }
        Insert: {
          calculation_id?: string | null
          created_at?: string | null
          employee_id: string
          generated_at?: string | null
          gross_salary: number
          id?: string
          net_salary: number
          period_id: string
          social_charges: number
          status?: string | null
          tax_charges: number
          updated_at?: string | null
        }
        Update: {
          calculation_id?: string | null
          created_at?: string | null
          employee_id?: string
          generated_at?: string | null
          gross_salary?: number
          id?: string
          net_salary?: number
          period_id?: string
          social_charges?: number
          status?: string | null
          tax_charges?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pay_slips_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "payroll_calculations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_slips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_payroll_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_slips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_slips_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_calculations: {
        Row: {
          calculation_date: string | null
          created_at: string | null
          employee_id: string
          gross_salary: number
          id: string
          net_salary: number
          period_id: string
          social_charges: number
          tax_charges: number
        }
        Insert: {
          calculation_date?: string | null
          created_at?: string | null
          employee_id: string
          gross_salary: number
          id?: string
          net_salary: number
          period_id: string
          social_charges: number
          tax_charges: number
        }
        Update: {
          calculation_date?: string | null
          created_at?: string | null
          employee_id?: string
          gross_salary?: number
          id?: string
          net_salary?: number
          period_id?: string
          social_charges?: number
          tax_charges?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_calculations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_payroll_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_calculations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_calculations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_elements: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          element_type: string
          employee_id: string
          id: string
          is_social_chargeable: boolean | null
          is_taxable: boolean | null
          period_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          element_type: string
          employee_id: string
          id?: string
          is_social_chargeable?: boolean | null
          is_taxable?: boolean | null
          period_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          element_type?: string
          employee_id?: string
          id?: string
          is_social_chargeable?: boolean | null
          is_taxable?: boolean | null
          period_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_elements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_payroll_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_elements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_elements_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_parameters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_parameters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_periods: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payroll_reports: {
        Row: {
          created_at: string | null
          generated_at: string | null
          id: string
          period_id: string
          report_data: Json | null
          report_type: string
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          period_id: string
          report_data?: Json | null
          report_type: string
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          period_id?: string
          report_data?: Json | null
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_reports_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_elements: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          name: string
          percentage: number | null
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          percentage?: number | null
          tenant_id: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          percentage?: number | null
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_elements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      social_contributions: {
        Row: {
          base_type: string
          created_at: string
          description: string | null
          id: string
          name: string
          rate: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          base_type: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          rate: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          base_type?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          rate?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_contributions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          status: string | null
          subscription_plan: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          status?: string | null
          subscription_plan?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          status?: string | null
          subscription_plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      employee_payroll_summary: {
        Row: {
          agreement_name: string | null
          base_salary: number | null
          email: string | null
          employee_number: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          pay_slips_count: number | null
          total_net_salary: number | null
        }
        Relationships: []
      }
      payroll_element_totals: {
        Row: {
          element_count: number | null
          element_type: string | null
          period_id: string | null
          total_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_elements_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_gross_salary: {
        Args: { employee_id: string }
        Returns: number
      }
      calculate_net_salary: {
        Args: { employee_id: string }
        Returns: number
      }
      calculate_social_charges: {
        Args: { employee_id: string }
        Returns: number
      }
      calculate_tax_charges: {
        Args: { employee_id: string }
        Returns: number
      }
      create_tenant: {
        Args:
          | { tenant_name: string; tenant_slug: string; admin_email: string }
          | {
              tenant_name: string
              tenant_slug: string
              admin_email: string
              admin_password: string
            }
        Returns: string
      }
      generate_pay_slip: {
        Args: { employee_id: string; period_start: string; period_end: string }
        Returns: string
      }
      get_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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
