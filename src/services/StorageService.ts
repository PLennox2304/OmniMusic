import { supabase } from './supabaseClient';

export const uploadMusic = async (file: File, userId: string): Promise<any> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('music-uploads')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('music-uploads')
      .getPublicUrl(filePath);

    // 3. Save metadata to DB
    const { error: dbError } = await supabase
      .from('user_uploads')
      .insert([{
        user_id: userId,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Eigener Upload',
        file_path: filePath,
        file_url: publicUrl,
        size: file.size
      }]);

    if (dbError) throw dbError;
    return publicUrl;
  } catch (err) {
    console.error("Upload failed", err);
    throw err;
  }
};

export const getUserUploads = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) console.error("Error fetching uploads", error);
  return data || [];
};
