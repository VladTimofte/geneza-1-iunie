import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Child {
  name: string;
  ageCategory: string;
}

export interface Registration {
  id?: string;
  parentName: string;
  parentPhone: string;
  children: Child[];
  createdAt?: Date | null;
}

const COLLECTION = "registrations";

export async function getRegistrations(): Promise<Registration[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Registration, "id">),
    createdAt: d.data().createdAt?.toDate() ?? null,
  }));
}

export function subscribeToRegistrations(
  callback: (registrations: Registration[]) => void
) {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Registration, "id">),
      createdAt: d.data().createdAt?.toDate() ?? null,
    }));
    callback(data);
  });
}

export async function addRegistration(
  data: Omit<Registration, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateRegistration(
  id: string,
  data: Omit<Registration, "id" | "createdAt">
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Înregistrarea nu mai există.");
    // Only update editable fields — createdAt is never touched
    tx.update(ref, {
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      children: data.children,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function deleteRegistration(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
