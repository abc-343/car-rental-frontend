interface IdTagProps {
  id: string;
  kind: 'car' | 'customer' | 'rental';
}

// Public ids (CAR-0001, CUS-0001, RNT-0001). Car ids are drawn as a licence plate.
export function IdTag({ id, kind }: IdTagProps) {
  return <span className={`id-tag id-tag-${kind}`}>{id}</span>;
}
