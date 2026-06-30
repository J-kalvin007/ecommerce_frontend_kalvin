import { apiPublic } from "@/lib/axios";

export interface ContactData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface NewsletterData {
    email: string;
}

export const subscribeToNewsletter = async (data: NewsletterData) => {
    try {
        const response = await apiPublic.post("/api/v1/notifications/newsletter/", data);
        return { ok: true, data: response.data };
    } catch (error: any) {
        return {
            ok: false,
            error: error.response?.data || { message: "Erreur lors de l'inscription à la newsletter" }
        };
    }
};

export const sendContactMessage = async (data: ContactData) => {
    try {
        const response = await apiPublic.post("/api/v1/notifications/contact/", data);
        return { ok: true, data: response.data };
    } catch (error: any) {
        return {
            ok: false,
            error: error.response?.data || { message: "Erreur lors de l'envoi du message" }
        };
    }
};
