import fs from "fs";
import path from "path";
import { db } from "./db";

export interface SettingsData {
  // Core MySQL fields
  companyName: string;
  companyServices: string;
  commercialSign: string;
  priceWeb: string;
  priceWhatsApp: string;
  priceCustom: string;

  // Extended Contact & Agency info
  companyPhone: string;
  companyPortfolioUrl: string;

  // AI Tone & Custom directives
  aiTone: "consultivo" | "directo" | "formal" | "amigable";
  aiCustomInstructions: string;

  // WhatsApp & Email Templates
  templateWhatsAppFirst: string;
  templateWhatsAppFollowup: string;
  templateWhatsAppQuote: string;
  templateEmailSubject: string;
  templateEmailBody: string;

  // CRM Automation
  defaultFollowUpDays: number;

  // Credenciales de Acceso
  adminUser: string;
  adminPassword: string;
}

export const DEFAULT_SETTINGS: SettingsData = {
  companyName: "Mi Agencia Tech",
  companyServices: "Desarrollo web corporativo, Catálogos digitales, Chatbots de WhatsApp con IA, Sistemas de reservas y CRM",
  commercialSign: "Atentamente,\nEquipo de Soluciones Comerciales",
  priceWeb: "Desde S/499",
  priceWhatsApp: "Desde S/299",
  priceCustom: "Desde S/899",

  companyPhone: "",
  companyPortfolioUrl: "",

  aiTone: "consultivo",
  aiCustomInstructions: "Siempre busca aportar valor concreto, destacar la ventaja de tener web con botón a WhatsApp y ofrecer una breve demo de 5 minutos.",

  templateWhatsAppFirst:
    "Hola equipo de {nombre}, un saludo cordial. Les escribe {mi_empresa}. Estuvimos revisando negocios destacados en el rubro de {rubro} en {ciudad} y notamos una gran oportunidad para captar más clientes mediante una página web profesional con botón directo a WhatsApp.\n\n¿Tendrían 5 minutos esta semana para compartirles una propuesta personalizada sin compromiso?\n\n{mi_firma}",

  templateWhatsAppFollowup:
    "Hola {nombre}, ¿cómo están? Les escribe {mi_empresa} para hacer un breve seguimiento a nuestro mensaje anterior sobre potenciar su canal digital.\n\n¿Tuvieron oportunidad de revisarlo o prefieren que coordinemos una breve llamada de 5 minutos? ¡Que tengan un excelente día!",

  templateWhatsAppQuote:
    "Estimado equipo de {nombre}, conforme a lo conversado, hemos preparado una cotización a medida para el desarrollo web corporativo ({precio_web}). Incluye diseño adaptado a celulares, integración directa a WhatsApp y posicionamiento local.\n\n¿Me confirman si les gustaría recibir el documento en PDF por este medio?\n\n{mi_firma}",

  templateEmailSubject: "Propuesta comercial para potenciar la presencia digital de {nombre}",

  templateEmailBody:
    "Estimado equipo de {nombre},\n\nEspero se encuentren muy bien. Les escribe {mi_empresa}. Estuvimos analizando el sector de {rubro} en {ciudad} y encontramos un gran potencial en su negocio para incrementar su captación de clientes locales.\n\nNos encantaría agendar una breve videollamada de 10 minutos esta semana para presentarles una demostración adaptada a sus necesidades comerciales.\n\nQuedamos a su entera disposición.\n\n{mi_firma}",

  defaultFollowUpDays: 2,

  adminUser: "admin",
  adminPassword: "admin123",
};

const EXTENDED_SETTINGS_FILE = path.join(process.cwd(), "lib", "commercial_settings.json");

let inMemoryExtendedSettings: Partial<SettingsData> = {};

function loadExtendedSettings(): Partial<SettingsData> {
  try {
    if (fs.existsSync(EXTENDED_SETTINGS_FILE)) {
      const content = fs.readFileSync(EXTENDED_SETTINGS_FILE, "utf-8");
      inMemoryExtendedSettings = { ...inMemoryExtendedSettings, ...JSON.parse(content) };
      return inMemoryExtendedSettings;
    }
  } catch (e) {
    // Si el entorno no permite acceso al disco, continuar con memoria
  }
  return inMemoryExtendedSettings;
}

function saveExtendedSettings(data: Partial<SettingsData>) {
  inMemoryExtendedSettings = { ...inMemoryExtendedSettings, ...data };
  try {
    const current = loadExtendedSettings();
    const merged = { ...current, ...data };
    fs.writeFileSync(EXTENDED_SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");
  } catch (e) {
    // Entorno de producción de solo lectura (ej: serverless), los cambios persisten en memoria
  }
}

let cachedSettings: SettingsData | null = null;

export async function getAppSettings(): Promise<SettingsData> {
  if (cachedSettings) {
    return cachedSettings;
  }

  const extended = loadExtendedSettings();

  try {
    const settings = await db.appSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      const created = await db.appSettings.create({
        data: {
          id: "default",
          companyName: DEFAULT_SETTINGS.companyName,
          companyServices: DEFAULT_SETTINGS.companyServices,
          commercialSign: DEFAULT_SETTINGS.commercialSign,
          priceWeb: DEFAULT_SETTINGS.priceWeb,
          priceWhatsApp: DEFAULT_SETTINGS.priceWhatsApp,
          priceCustom: DEFAULT_SETTINGS.priceCustom,
        },
      });

      cachedSettings = {
        companyName: created.companyName,
        companyServices: created.companyServices || DEFAULT_SETTINGS.companyServices,
        commercialSign: created.commercialSign || DEFAULT_SETTINGS.commercialSign,
        priceWeb: created.priceWeb,
        priceWhatsApp: created.priceWhatsApp,
        priceCustom: created.priceCustom,

        companyPhone: extended.companyPhone ?? DEFAULT_SETTINGS.companyPhone,
        companyPortfolioUrl: extended.companyPortfolioUrl ?? DEFAULT_SETTINGS.companyPortfolioUrl,
        aiTone: extended.aiTone ?? DEFAULT_SETTINGS.aiTone,
        aiCustomInstructions: extended.aiCustomInstructions ?? DEFAULT_SETTINGS.aiCustomInstructions,
        templateWhatsAppFirst: extended.templateWhatsAppFirst ?? DEFAULT_SETTINGS.templateWhatsAppFirst,
        templateWhatsAppFollowup: extended.templateWhatsAppFollowup ?? DEFAULT_SETTINGS.templateWhatsAppFollowup,
        templateWhatsAppQuote: extended.templateWhatsAppQuote ?? DEFAULT_SETTINGS.templateWhatsAppQuote,
        templateEmailSubject: extended.templateEmailSubject ?? DEFAULT_SETTINGS.templateEmailSubject,
        templateEmailBody: extended.templateEmailBody ?? DEFAULT_SETTINGS.templateEmailBody,
        defaultFollowUpDays: extended.defaultFollowUpDays ?? DEFAULT_SETTINGS.defaultFollowUpDays,
        adminUser: extended.adminUser ?? (process.env.ADMIN_USER || DEFAULT_SETTINGS.adminUser),
        adminPassword: extended.adminPassword ?? (process.env.ADMIN_PASSWORD || DEFAULT_SETTINGS.adminPassword),
      };
      return cachedSettings;
    }

    cachedSettings = {
      companyName: settings.companyName,
      companyServices: settings.companyServices || DEFAULT_SETTINGS.companyServices,
      commercialSign: settings.commercialSign || DEFAULT_SETTINGS.commercialSign,
      priceWeb: settings.priceWeb,
      priceWhatsApp: settings.priceWhatsApp,
      priceCustom: settings.priceCustom,

      companyPhone: extended.companyPhone ?? DEFAULT_SETTINGS.companyPhone,
      companyPortfolioUrl: extended.companyPortfolioUrl ?? DEFAULT_SETTINGS.companyPortfolioUrl,
      aiTone: extended.aiTone ?? DEFAULT_SETTINGS.aiTone,
      aiCustomInstructions: extended.aiCustomInstructions ?? DEFAULT_SETTINGS.aiCustomInstructions,
      templateWhatsAppFirst: extended.templateWhatsAppFirst ?? DEFAULT_SETTINGS.templateWhatsAppFirst,
      templateWhatsAppFollowup: extended.templateWhatsAppFollowup ?? DEFAULT_SETTINGS.templateWhatsAppFollowup,
      templateWhatsAppQuote: extended.templateWhatsAppQuote ?? DEFAULT_SETTINGS.templateWhatsAppQuote,
      templateEmailSubject: extended.templateEmailSubject ?? DEFAULT_SETTINGS.templateEmailSubject,
      templateEmailBody: extended.templateEmailBody ?? DEFAULT_SETTINGS.templateEmailBody,
      defaultFollowUpDays: extended.defaultFollowUpDays ?? DEFAULT_SETTINGS.defaultFollowUpDays,
      adminUser: extended.adminUser ?? (process.env.ADMIN_USER || DEFAULT_SETTINGS.adminUser),
      adminPassword: extended.adminPassword ?? (process.env.ADMIN_PASSWORD || DEFAULT_SETTINGS.adminPassword),
    };
    return cachedSettings;
  } catch (error) {
    console.error("Error retrieving settings from DB, using defaults:", error);
    return { ...DEFAULT_SETTINGS, ...extended };
  }
}

export async function updateAppSettings(data: Partial<SettingsData>): Promise<SettingsData> {
  const current = await getAppSettings();

  // Save extended settings to JSON file
  saveExtendedSettings({
    companyPhone: data.companyPhone ?? current.companyPhone,
    companyPortfolioUrl: data.companyPortfolioUrl ?? current.companyPortfolioUrl,
    aiTone: data.aiTone ?? current.aiTone,
    aiCustomInstructions: data.aiCustomInstructions ?? current.aiCustomInstructions,
    templateWhatsAppFirst: data.templateWhatsAppFirst ?? current.templateWhatsAppFirst,
    templateWhatsAppFollowup: data.templateWhatsAppFollowup ?? current.templateWhatsAppFollowup,
    templateWhatsAppQuote: data.templateWhatsAppQuote ?? current.templateWhatsAppQuote,
    templateEmailSubject: data.templateEmailSubject ?? current.templateEmailSubject,
    templateEmailBody: data.templateEmailBody ?? current.templateEmailBody,
    defaultFollowUpDays: data.defaultFollowUpDays ?? current.defaultFollowUpDays,
    adminUser: data.adminUser ?? current.adminUser,
    adminPassword: data.adminPassword ?? current.adminPassword,
  });

  try {
    const updated = await db.appSettings.upsert({
      where: { id: "default" },
      update: {
        companyName: data.companyName ?? current.companyName,
        companyServices: data.companyServices ?? current.companyServices,
        commercialSign: data.commercialSign ?? current.commercialSign,
        priceWeb: data.priceWeb ?? current.priceWeb,
        priceWhatsApp: data.priceWhatsApp ?? current.priceWhatsApp,
        priceCustom: data.priceCustom ?? current.priceCustom,
      },
      create: {
        id: "default",
        companyName: data.companyName ?? DEFAULT_SETTINGS.companyName,
        companyServices: data.companyServices ?? DEFAULT_SETTINGS.companyServices,
        commercialSign: data.commercialSign ?? DEFAULT_SETTINGS.commercialSign,
        priceWeb: data.priceWeb ?? DEFAULT_SETTINGS.priceWeb,
        priceWhatsApp: data.priceWhatsApp ?? DEFAULT_SETTINGS.priceWhatsApp,
        priceCustom: data.priceCustom ?? DEFAULT_SETTINGS.priceCustom,
      },
    });

    const result: SettingsData = {
      companyName: updated.companyName,
      companyServices: updated.companyServices || DEFAULT_SETTINGS.companyServices,
      commercialSign: updated.commercialSign || DEFAULT_SETTINGS.commercialSign,
      priceWeb: updated.priceWeb,
      priceWhatsApp: updated.priceWhatsApp,
      priceCustom: updated.priceCustom,

      companyPhone: data.companyPhone ?? current.companyPhone,
      companyPortfolioUrl: data.companyPortfolioUrl ?? current.companyPortfolioUrl,
      aiTone: data.aiTone ?? current.aiTone,
      aiCustomInstructions: data.aiCustomInstructions ?? current.aiCustomInstructions,
      templateWhatsAppFirst: data.templateWhatsAppFirst ?? current.templateWhatsAppFirst,
      templateWhatsAppFollowup: data.templateWhatsAppFollowup ?? current.templateWhatsAppFollowup,
      templateWhatsAppQuote: data.templateWhatsAppQuote ?? current.templateWhatsAppQuote,
      templateEmailSubject: data.templateEmailSubject ?? current.templateEmailSubject,
      templateEmailBody: data.templateEmailBody ?? current.templateEmailBody,
      defaultFollowUpDays: data.defaultFollowUpDays ?? current.defaultFollowUpDays,
      adminUser: data.adminUser ?? current.adminUser,
      adminPassword: data.adminPassword ?? current.adminPassword,
    };
    cachedSettings = result;
    return result;
  } catch (error) {
    console.error("Error updating settings in DB, saved extended settings:", error);
    const result: SettingsData = {
      ...current,
      ...data,
    };
    cachedSettings = result;
    return result;
  }
}

/**
 * Reemplaza variables dinámicas {variable} en plantillas con datos del negocio y agencia.
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number | undefined | null>
): string {
  if (!template) return "";
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, "gi");
    result = result.replace(regex, String(value ?? ""));
  }
  return result;
}
