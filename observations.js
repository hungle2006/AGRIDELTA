function connect() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('agridelta-observations', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('entries', {keyPath:'id'});
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function transact(mode, operation) {
  const database = await connect();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('entries', mode);
      const request = operation(transaction.objectStore('entries'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? Error('Transaction aborted'));
    });
  } finally {
    database.close();
  }
}

export const listObservations = () => transact('readonly', store => store.getAll());
export const saveObservation = entry => transact('readwrite', store => store.put(entry));
export const deleteObservation = id => transact('readwrite', store => store.delete(id));
