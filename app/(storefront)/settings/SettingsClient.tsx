"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Save, Settings, Shield, User as UserIcon } from "lucide-react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import Button from "@/components/special/ui/Button";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/special/ui/Card";
import Input from "@/components/special/ui/Input";
import { getCurrentUser, updateUser } from "@/fonctions_api/auth.api";
import { useAuthStore } from "@/store/authStore";

type FormState = {
  name: string;
  first_name: string;
  last_name: string;
  email: string;
};

function buildInitialState(user?: {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
} | null) {
  return {
    name: user?.username ?? "",
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
  };
}

export default function SettingsClient() {
  const { user, updateProfile: updateAuthStore } = useAuthStore();
  const [form, setForm] = useState<FormState>(() => buildInitialState(user));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const profileRes = await getCurrentUser();
        if (!isMounted) return;
        if (!profileRes.ok) throw new Error(profileRes.error.message);
        const profile = profileRes.data;

        updateAuthStore(profile);
        setForm({
          name: profile.username ?? "",
          first_name: profile.first_name ?? "",
          last_name: profile.last_name ?? "",
          email: profile.email ?? "",
        });
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error ? error.message : "Impossible de charger votre profil.";
        setErrorMessage(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [updateAuthStore]);

  function handleChange(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const profileResult = await updateUser((user as any)?.id || 0, {
        username: form.name,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
      });
      if (!profileResult.ok) throw new Error(profileResult.error.message);
      const profile = profileResult.data;

      updateAuthStore(profile);
      setForm({
        name: profile.username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
      });
      setSuccessMessage("Profil mis a jour.");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response
          ? JSON.stringify(error.response.data)
          : error instanceof Error
            ? error.message
            : "La mise a jour a echoue.";

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-76px)] bg-[radial-gradient(circle_at_top_left,_rgba(35,190,49,0.12),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(255,255,255,1))]">
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary/70">
                Compte
              </p>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Parametres du profil
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Cette page edite directement les champs Django exposes par
                <code className="mx-1 rounded bg-surface-alt px-1.5 py-0.5 text-xs">
                  /api/auth/user/
                </code>
                : username, first_name, last_name et email.
              </p>
            </div>
            <div className="hidden rounded-2xl border border-primary/15 bg-white/80 p-4 shadow-sm lg:block">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Compte synchronise</p>
                  <p className="text-xs text-muted">Les donnees enregistrees rafraichissent le store local.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <Card className="p-6" variant="default">
              <CardHeader className="mb-4">
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Modifiez votre nom d&apos;utilisateur, votre prenom, votre nom et votre email.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="flex min-h-64 items-center justify-center">
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Chargement du profil...
                    </div>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <Input
                      label="Username"
                      value={form.name}
                      onChange={(event) => handleChange("name", event.target.value)}
                      placeholder="votre_username"
                      icon={<UserIcon className="h-4 w-4" />}
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                      <Input
                        label="Prenom"
                        value={form.first_name}
                        onChange={(event) => handleChange("first_name", event.target.value)}
                        placeholder="Jean"
                        icon={<UserIcon className="h-4 w-4" />}
                      />
                      <Input
                        label="Nom"
                        value={form.last_name}
                        onChange={(event) => handleChange("last_name", event.target.value)}
                        placeholder="Dupont"
                        icon={<UserIcon className="h-4 w-4" />}
                      />
                    </div>

                    <Input
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      placeholder="client@example.com"
                      icon={<Mail className="h-4 w-4" />}
                    />

                    {errorMessage ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                      </div>
                    ) : null}

                    {successMessage ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {successMessage}
                      </div>
                    ) : null}

                    <div className="flex justify-end">
                      <Button type="submit" icon={Save} isLoading={isSaving}>
                        Enregistrer les modifications
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="p-6" variant="glass">
              <CardHeader className="mb-4">
                <CardTitle className="text-xl">Ce qui est envoye</CardTitle>
                <CardDescription>
                  Le formulaire reste volontairement simple pour suivre le backend sans logique cachee.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-sm text-muted">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Payload PATCH
                  </p>
                  <p className="mb-2 text-xs text-muted">
                    `name` dans l&apos;interface est envoye au backend Django sous `username`.
                  </p>
                  <pre className="overflow-x-auto text-xs leading-6 text-foreground/80">
{`{
  "username": "${form.name || "..."}",
  "first_name": "${form.first_name || "..."}",
  "last_name": "${form.last_name || "..."}",
  "email": "${form.email || "..."}"
}`}
                  </pre>
                </div>

                <p>
                  Si votre backend renvoie une erreur de validation, elle remonte ici telle quelle pour
                  faciliter le debug.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
