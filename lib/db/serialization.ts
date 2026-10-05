interface MongoDoc {
  _id?: any;
  __v?: number;
  toObject?: () => any;
  [key: string]: any;
}

export function convertDoc<T = any>(
  doc: MongoDoc | MongoDoc[] | null,
): T | null {
  if (!doc) return null;
  if (Array.isArray(doc)) {
    return doc.map((item) => convertDoc(item)) as T;
  }

  const obj = doc.toObject ? doc.toObject() : doc;
  const serialized = JSON.parse(JSON.stringify(obj));

  if (serialized._id) {
    serialized.id = serialized._id.toString();
    delete serialized._id;
  }

  delete serialized.__v;

  return serialized as T;
}

export function convertDocArray<T = any>(docs: MongoDoc[] | null): T[] {
  if (!docs || !Array.isArray(docs)) return [];
  return docs
    .map((doc) => convertDoc<T>(doc))
    .filter((item): item is T => item !== null);
}
