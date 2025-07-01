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
      company_info: {
        Row: {
          adresse: string | null
          convention_collective: string | null
          created_at: string
          email: string | null
          id: string
          ninea: string | null
          nom: string
          pays: string | null
          rccm: string | null
          telephone: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          convention_collective?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ninea?: string | null
          nom: string
          pays?: string | null
          rccm?: string | null
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          convention_collective?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ninea?: string | null
          nom?: string
          pays?: string | null
          rccm?: string | null
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      conventions: {
        Row: {
          created_at: string
          date_entree_vigueur: string | null
          description: string | null
          id: string
          intitule: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_entree_vigueur?: string | null
          description?: string | null
          id?: string
          intitule: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_entree_vigueur?: string | null
          description?: string | null
          id?: string
          intitule?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          adresse: string | null
          categorie: string | null
          code_postal: string | null
          contact_urgence_nom: string | null
          contact_urgence_telephone: string | null
          convention_collective_id: string | null
          created_at: string
          date_entree: string | null
          date_naissance: string | null
          date_retour_conge: string | null
          date_sortie: string | null
          diplomes: string | null
          email: string | null
          id: string
          indemnite_transport: number | null
          lieu_naissance: string | null
          matricule: string
          motif_sortie: string | null
          nationalite: string | null
          nom: string
          nombre_enfants: number | null
          numero_cnss: string | null
          numero_ipres: string | null
          photo_url: string | null
          poste: string | null
          prenom: string
          prime_anciennete_taux: number | null
          rib: string | null
          salaire_base: number | null
          sexe: string
          situation_familiale: string | null
          statut: string
          sur_salaire: number | null
          telephone: string | null
          type_contrat: string
          updated_at: string
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          categorie?: string | null
          code_postal?: string | null
          contact_urgence_nom?: string | null
          contact_urgence_telephone?: string | null
          convention_collective_id?: string | null
          created_at?: string
          date_entree?: string | null
          date_naissance?: string | null
          date_retour_conge?: string | null
          date_sortie?: string | null
          diplomes?: string | null
          email?: string | null
          id?: string
          indemnite_transport?: number | null
          lieu_naissance?: string | null
          matricule: string
          motif_sortie?: string | null
          nationalite?: string | null
          nom: string
          nombre_enfants?: number | null
          numero_cnss?: string | null
          numero_ipres?: string | null
          photo_url?: string | null
          poste?: string | null
          prenom: string
          prime_anciennete_taux?: number | null
          rib?: string | null
          salaire_base?: number | null
          sexe: string
          situation_familiale?: string | null
          statut: string
          sur_salaire?: number | null
          telephone?: string | null
          type_contrat: string
          updated_at?: string
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          categorie?: string | null
          code_postal?: string | null
          contact_urgence_nom?: string | null
          contact_urgence_telephone?: string | null
          convention_collective_id?: string | null
          created_at?: string
          date_entree?: string | null
          date_naissance?: string | null
          date_retour_conge?: string | null
          date_sortie?: string | null
          diplomes?: string | null
          email?: string | null
          id?: string
          indemnite_transport?: number | null
          lieu_naissance?: string | null
          matricule?: string
          motif_sortie?: string | null
          nationalite?: string | null
          nom?: string
          nombre_enfants?: number | null
          numero_cnss?: string | null
          numero_ipres?: string | null
          photo_url?: string | null
          poste?: string | null
          prenom?: string
          prime_anciennete_taux?: number | null
          rib?: string | null
          salaire_base?: number | null
          sexe?: string
          situation_familiale?: string | null
          statut?: string
          sur_salaire?: number | null
          telephone?: string | null
          type_contrat?: string
          updated_at?: string
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_convention_collective_id_fkey"
            columns: ["convention_collective_id"]
            isOneToOne: false
            referencedRelation: "conventions"
            referencedColumns: ["id"]
          },
        ]
      }
      pay_slips: {
        Row: {
          annee: number
          cotisations_patronales: number | null
          cotisations_salariales: number | null
          created_at: string
          date_generation: string | null
          employe_id: string
          id: string
          mois: string
          salaire_brut: number | null
          salaire_net: number | null
          updated_at: string
        }
        Insert: {
          annee: number
          cotisations_patronales?: number | null
          cotisations_salariales?: number | null
          created_at?: string
          date_generation?: string | null
          employe_id: string
          id?: string
          mois: string
          salaire_brut?: number | null
          salaire_net?: number | null
          updated_at?: string
        }
        Update: {
          annee?: number
          cotisations_patronales?: number | null
          cotisations_salariales?: number | null
          created_at?: string
          date_generation?: string | null
          employe_id?: string
          id?: string
          mois?: string
          salaire_brut?: number | null
          salaire_net?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pay_slips_employe_id_fkey"
            columns: ["employe_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_parameters: {
        Row: {
          created_at: string
          date_application: string
          id: string
          taux_cnss: number
          taux_cotisation_patronale: number
          taux_ipres: number
          taux_ir: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_application: string
          id?: string
          taux_cnss: number
          taux_cotisation_patronale: number
          taux_ipres: number
          taux_ir: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_application?: string
          id?: string
          taux_cnss?: number
          taux_cotisation_patronale?: number
          taux_ipres?: number
          taux_ir?: number
          updated_at?: string
        }
        Relationships: []
      }
      salary_elements: {
        Row: {
          annee: number | null
          cnss_salarie: number | null
          contrat: string | null
          created_at: string
          emploi: string | null
          employe_id: string
          id: string
          indemnite_transport: number | null
          ipres_salarie: number | null
          ir: number | null
          mois: string | null
          prime_anciennete: number | null
          prime_logement: number | null
          salaire_brut: number
          salaire_net: number | null
          situation_contrat: string | null
          updated_at: string
        }
        Insert: {
          annee?: number | null
          cnss_salarie?: number | null
          contrat?: string | null
          created_at?: string
          emploi?: string | null
          employe_id: string
          id?: string
          indemnite_transport?: number | null
          ipres_salarie?: number | null
          ir?: number | null
          mois?: string | null
          prime_anciennete?: number | null
          prime_logement?: number | null
          salaire_brut: number
          salaire_net?: number | null
          situation_contrat?: string | null
          updated_at?: string
        }
        Update: {
          annee?: number | null
          cnss_salarie?: number | null
          contrat?: string | null
          created_at?: string
          emploi?: string | null
          employe_id?: string
          id?: string
          indemnite_transport?: number | null
          ipres_salarie?: number | null
          ir?: number | null
          mois?: string | null
          prime_anciennete?: number | null
          prime_logement?: number | null
          salaire_brut?: number
          salaire_net?: number | null
          situation_contrat?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_elements_employe_id_fkey"
            columns: ["employe_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      social_contributions: {
        Row: {
          annee: number
          cnss_salarie: number | null
          cotisation_patronale: number | null
          created_at: string
          employe_id: string
          id: string
          ipres_salarie: number | null
          ir: number | null
          mois: string
          updated_at: string
        }
        Insert: {
          annee: number
          cnss_salarie?: number | null
          cotisation_patronale?: number | null
          created_at?: string
          employe_id: string
          id?: string
          ipres_salarie?: number | null
          ir?: number | null
          mois: string
          updated_at?: string
        }
        Update: {
          annee?: number
          cnss_salarie?: number | null
          cotisation_patronale?: number | null
          created_at?: string
          employe_id?: string
          id?: string
          ipres_salarie?: number | null
          ir?: number | null
          mois?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_contributions_employe_id_fkey"
            columns: ["employe_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
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
