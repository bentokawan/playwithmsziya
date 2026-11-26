import { useEffect, useMemo, useState } from 'react';
import type { MediaLicense, MediaRow } from '@/lib/supabase/types';
import styles from './MediaField.module.css';
import { uploadMedia } from './upload';
import type { MediaUploadType } from './validate';

export interface MediaFieldProps {
  readonly type: MediaUploadType;
  readonly storagePrefix: string;
  readonly initialFile?: File | null;
  readonly defaultLicense?: MediaLicense;
  readonly onUploaded: (media: MediaRow) => void;
}

const LICENSE_OPTIONS: readonly { readonly value: MediaLicense; readonly label: string }[] = [
  { value: 'project', label: 'Milik proyek (project)' },
  { value: 'pixabay', label: 'Pixabay' },
  { value: 'cc0', label: 'CC0' },
  { value: 'cc-by-4.0', label: 'CC-BY 4.0 (wajib kredit)' },
  { value: 'recorded-consent', label: 'Rekaman sendiri (dengan izin)' },
];

export function MediaField({
  type,
  storagePrefix,
  initialFile = null,
  defaultLicense = 'project',
  onUploaded,
}: MediaFieldProps) {
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const file = pickedFile ?? initialFile;
  const [license, setLicense] = useState<MediaLicense>(defaultLicense);
  const [author, setAuthor] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<readonly string[]>([]);
  const [warnings, setWarnings] = useState<readonly string[]>([]);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const accept =
    type === 'object-image'
      ? '.svg,.png,.webp,image/svg+xml,image/png,image/webp'
      : '.mp3,.wav,.m4a,audio/*';

  const handleSave = async () => {
    if (!file || uploading) return;
    const localErrors: string[] = [];
    if (license === 'cc-by-4.0' && (!author.trim() || !sourceUrl.trim())) {
      localErrors.push('Lisensi CC-BY 4.0 mewajibkan nama pembuat dan URL sumber.');
    }
    if (license === 'recorded-consent' && !consentChecked) {
      localErrors.push('Centang pernyataan izin rekaman terlebih dahulu.');
    }
    if (localErrors.length > 0) {
      setErrors(localErrors);
      return;
    }

    setUploading(true);
    setErrors([]);
    setWarnings([]);
    const res = await uploadMedia({
      file,
      type,
      storagePrefix,
      license,
      author: author.trim() || null,
      sourceUrl: sourceUrl.trim() || null,
    });
    setUploading(false);

    if (!res.ok) {
      setErrors(res.errors);
      return;
    }
    setWarnings(res.warnings);
    setPickedFile(null);
    onUploaded(res.media);
  };

  return (
    <div className={styles.box}>
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          setPickedFile(e.target.files?.[0] ?? null);
          setErrors([]);
          setWarnings([]);
        }}
      />

      {previewUrl &&
        (type === 'object-image' ? (
          <img src={previewUrl} alt="" className={styles.previewImg} />
        ) : (
          <audio controls src={previewUrl} />
        ))}

      {file && (
        <>
          <div className={styles.row}>
            <select
              className={styles.select}
              value={license}
              onChange={(e) => setLicense(e.target.value as MediaLicense)}
              aria-label="Lisensi"
            >
              {LICENSE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              className={styles.input}
              placeholder="Pembuat (opsional / wajib CC-BY)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />

            <input
              type="url"
              className={styles.input}
              placeholder="URL sumber"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </div>

          {license === 'recorded-consent' && (
            <label className={styles.row}>
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <span>{'Saya punya izin tertulis dari orang yang direkam / orang tuanya'}</span>
            </label>
          )}

          <div>
            <button type="button" className={styles.btn} disabled={uploading} onClick={() => void handleSave()}>
              {uploading ? 'Mengunggah…' : 'Simpan media'}
            </button>
          </div>
        </>
      )}

      {errors.map((err) => (
        <div key={err} role="alert" className={styles.err}>
          {err}
        </div>
      ))}
      {warnings.map((w) => (
        <div key={w} className={styles.warn}>
          {w}
        </div>
      ))}
    </div>
  );
}
