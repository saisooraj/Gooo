import { getStorage } from 'firebase/storage'
import { firebaseApp } from './config'

/** Reserved for V2 (travel document storage) — see storage.rules. */
export const storage = getStorage(firebaseApp)
