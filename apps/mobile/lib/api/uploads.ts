import { uploadResponseSchema } from '@travel-app/shared/contracts/uploads';
import { API_V1 } from '../config';
import { getAccessToken, parseApiData } from './client';

async function uploadImage(path: string, uri: string): Promise<string> {
  const token = await getAccessToken();
  const form = new FormData();
  const name = uri.split('/').pop() || 'upload.jpg';
  form.append('file', {
    uri,
    name,
    type: 'image/jpeg',
  } as unknown as Blob);

  const res = await fetch(`${API_V1}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || 'UPLOAD_FAILED');
  }
  return parseApiData(json, uploadResponseSchema).publicUrl;
}

export async function uploadPlaceCover(uri: string): Promise<string> {
  return uploadImage('/uploads/place-cover', uri);
}

export async function uploadReviewImage(uri: string): Promise<string> {
  return uploadImage('/uploads/review-image', uri);
}

export async function uploadAvatar(uri: string): Promise<string> {
  return uploadImage('/uploads/avatar', uri);
}
