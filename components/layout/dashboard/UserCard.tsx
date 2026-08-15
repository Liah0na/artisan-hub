'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Artisan } from '@/lib/types/artisan';

type Props = {
  user: Artisan | null;
  onUpdate?: (data: Partial<Artisan>) => Promise<void>;
};

export default function UserCard({ user, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(
    user?.avatar || ''
  );
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  if (!user) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSave = async () => {
    let avatarUrl = formData.avatar;

    if (onUpdate) {
      await onUpdate(formData);
    }

    if (selectedFile) {
      const uploadedUrl = await uploadAvatar();

      if (uploadedUrl) {
        avatarUrl = uploadedUrl;
      }
    }

    const updatedData = {
      ...formData,
      avatar: avatarUrl,
    };

    if (onUpdate) {
      await onUpdate(updatedData);
    }

    setIsEditing(false);
  };
  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      avatar: user.avatar || '',
    });
    setIsEditing(false);
  };
  const handleAvatarChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    // Preview local
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };
  const uploadAvatar = async (): Promise<string | null> => {
    if (!selectedFile) return formData.avatar;

    try {
      setUploading(true);

      const data = new FormData();
      data.append('file', selectedFile);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      return result.url;

    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-start gap-4 mt-6">
      
      {/* Avatar */}
      <div className="relative w-64 h-64 min-w-32 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden">  
        <label
          htmlFor="avatar-upload"
          className={`relative w-64 h-64 min-w-32 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden ${
            isEditing ? 'cursor-pointer hover:opacity-80' : ''
          }`}
        >

          {preview ? (
            <Image
              src={preview}
              alt={user.name}
              fill
              className="object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}

          {isEditing && (
            <div className="absolute bottom-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Change Photo
            </div>
          )}
        </label>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="avatar-upload"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1">

        {/* NAME */}
        {isEditing ? (
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-sm"
          />
        ) : (
          <h3 className="text-lg font-semibold text-gray-800">
            {user.name}
          </h3>
        )}

        {/* EMAIL */}
        {isEditing ? (
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-sm"
          />
        ) : (
          <p className="text-sm text-gray-500">
            {user.email}
          </p>
        )}

        {/* BIO */}
        {isEditing ? (
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-sm mt-1"
            rows={2}
          />
        ) : (
          user.bio && (
            <p className="font-secondary text-gray-800 mt-1">
              {user.bio}
            </p>
          )
        )}

        {/* CREATED AT */}
        <div className="text-sm text-gray-400 mt-1">
          {user.createdAt
            ? `Joined ${new Date(user.createdAt).toLocaleDateString()}`
            : ''}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-2">

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm px-3 py-1 bg-gray-900 text-white rounded hover:bg-gray-700"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500"
            >
              Save
            </button>

            <button
              onClick={handleCancel}
              className="text-sm px-3 py-1 bg-gray-300 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </>
        )}

      </div>
    </div>
  );
}