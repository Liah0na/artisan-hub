"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = /^image\/(jpeg|png|webp)$/;

type Avatar = { url: string; publicId: string } | null;

type ProfileFormProps = {
  profile: {
    name: string;
    email: string;
    avatar: Avatar;
    bio: string | null;
    phone: string | null;
    instagram: string | null;
    location: string | null;
  };
};

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();

  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [instagram, setInstagram] = useState(profile.instagram ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  // `avatar` mirrors what's actually persisted (or about to be, once saved).
  // `null` means "no avatar" / "remove it". `avatarFile` holds a pending
  // local selection that hasn't been uploaded yet.
  const [avatar, setAvatar] = useState<Avatar>(profile.avatar);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar?.url ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.test(file.type)) {
      setError("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setError("");
    setAvatarFile(file);
    setAvatarRemoved(false);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleRemoveAvatar() {
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarRemoved(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      let finalAvatar: Avatar | undefined = undefined; // undefined = don't touch

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadResponse = await fetch("/api/dashboard/uploads/avatar", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.error || "Não foi possível enviar a foto.");
        finalAvatar = { url: uploadData.url, publicId: uploadData.publicId };
      } else if (avatarRemoved) {
        finalAvatar = null;
      }

      const body: Record<string, unknown> = { name, bio, phone, instagram, location };
      if (finalAvatar !== undefined) body.avatar = finalAvatar;

      const response = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Não foi possível salvar o perfil.");
        return;
      }

      if (finalAvatar !== undefined) {
        setAvatar(finalAvatar);
        setAvatarPreview(finalAvatar?.url ?? "");
      }
      setAvatarFile(null);
      setAvatarRemoved(false);
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const hasAvatarToShow = Boolean(avatarPreview);
  const canRemove = hasAvatarToShow && (avatarFile || avatar);

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-5">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border bg-gray-100">
          {hasAvatarToShow ? (
            <Image src={avatarPreview} alt="Foto de perfil" fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">Sem foto</div>
          )}
        </div>
        <div>
          <label htmlFor="avatar" className="mb-2 block text-sm font-medium">Foto de perfil</label>
          <input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          <p className="mt-1 text-xs text-gray-500">JPG, PNG ou WebP. Máximo de 5 MB.</p>
          {canRemove && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="mt-2 text-xs font-medium text-red-600 underline"
            >
              Remover foto
            </button>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">Nome completo</label>
        <input id="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} className="w-full rounded-md border px-3 py-2" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">E-mail</label>
        <p className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-500">{profile.email}</p>
      </div>

      <div>
        <label htmlFor="bio" className="mb-2 block text-sm font-medium">Biografia</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Conte sobre você, sua técnica e o que te inspira a criar."
          className="w-full rounded-md border px-3 py-2"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{bio.length}/1000</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">Telefone / WhatsApp</label>
          <input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} placeholder="+55 21 90000-0000" className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="instagram" className="mb-2 block text-sm font-medium">Instagram</label>
          <input id="instagram" value={instagram} onChange={(event) => setInstagram(event.target.value)} maxLength={50} placeholder="@seu_usuario" className="w-full rounded-md border px-3 py-2" />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="mb-2 block text-sm font-medium">Cidade / localização</label>
        <input id="location" value={location} onChange={(event) => setLocation(event.target.value)} maxLength={120} placeholder="Niterói, RJ" className="w-full rounded-md border px-3 py-2" />
      </div>

      {error && <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && !error && <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">Perfil atualizado com sucesso.</p>}

      <button disabled={loading} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {loading ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}
