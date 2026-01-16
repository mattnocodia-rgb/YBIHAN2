
export interface DriveExtractionResult {
  id: string;
  url: string;
  is_file: boolean;
  error?: string;
}

/**
 * Extrait l'ID Google Drive de manière ultra-robuste.
 */
export const extractDriveId = (url: string): DriveExtractionResult | null => {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let id = '';
  let is_file = false;

  // Pattern matching pour dossiers et fichiers
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9-_]+)/);

  if (folderMatch) {
    id = folderMatch[1];
  } else if (fileMatch) {
    id = fileMatch[1];
    is_file = true;
  } else if (idParamMatch) {
    id = idParamMatch[1];
  } else {
    // Fallback : on prend ce qui ressemble à un ID si l'URL est courte
    const cleanId = trimmed.split(/[/?&]/).pop();
    if (cleanId && cleanId.length >= 25) {
      id = cleanId;
    }
  }

  if (!id || id.length < 10) {
    return { id: '', url: '', is_file: false, error: 'Lien Google Drive invalide' };
  }

  return {
    id,
    url: `https://drive.google.com/drive/folders/${id}`,
    is_file
  };
};
