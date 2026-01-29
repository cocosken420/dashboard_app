import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { subOptionsInterface, Task, User, EmployeeInterface } from "./types";
import { db } from "./firebase";
import { decryptSimple, EncryptedUserSimple, encryptSimple } from "./crypto";


  
export  async function checkLoginMethod(email: string,searchTarget:"password"|"google"):Promise<boolean> {
   
  try {
    const q = query(
    collection(db, "employees"),
    where("id", "==", email)
  )

  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return false
  }
  // assuming email is unique → take first match
  const doc = snapshot.docs
  let response = false;
  for(let x=0;x<doc.length;x++){
    const data = doc[x].data() as EmployeeInterface;
    if(data.authMethod==searchTarget)response=true;
  }
  return response
} catch (error) {
    return false
  }
}
export async function updateUserSignInMethod(userID:string,loginMethod:string){
  const checkUserSignInMethod = await checkLoginMethod(userID,"password")
  if(!checkUserSignInMethod) return;
  try {
    const userRef = doc(db, "employees", userID);
    await updateDoc(userRef, {
      authMethod:loginMethod
    });
    return true;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update user in database");
  }
}
export async function updateEmailVerification(userID:string){
  try {
    const userRef = doc(db, "employees", userID);
    await updateDoc(userRef, {
      veryfiedEmail:true
    });
    return true;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update user in database");
  }
}
  export  async function getUserByCredential(credentialname:string,email: string):Promise<EmployeeInterface|null> {
   
    try {
      const q = query(
      collection(db, "employees"),
      where(credentialname, "==", email)
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    // assuming email is unique → take first match
    const doc = snapshot.docs[0]
    return doc.data() as EmployeeInterface
    } catch (error) {
      return null
    }
  }

  export async function addNewWorkerToDb(user: EmployeeInterface) {
  try {
    const userRef = doc(db, "employees", user.id)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, 
        {...user}
      )
    }
    return true
  } catch (error) {
    throw new Error("Failed to add user to database")
  }
}
// lib/userTasks.ts


export const removeUserById = async (userId: string) => {
    try {
        await deleteDoc(doc(db, "users", userId))
        return true
    } catch (error) {
        throw new Error("Failed to remove user from database")
    }

}
 
export const addTaskToUser = async (userId: string, task: Task) => {
    try {
        const ref = doc(db, "users", userId)
        const docSnap = await getDoc(ref)
        
        if (!docSnap.exists()) {
            throw new Error("User not found")
        }
        
        // Decrypt user
        const encryptedUser = docSnap.data()
        const user = decryptSimple(encryptedUser as EncryptedUserSimple)
        
        // Add task
        user.tasks.push(task)
        // Re-encrypt and save
        const newEncryptedUser = encryptSimple(user)
        await setDoc(ref, newEncryptedUser)
        
        return true
    } catch (error) {
        console.error(error)
        throw new Error("Failed to add task to user")
    }
}

// Remove task by re-encrypting entire user
export const removeTaskFromUser = async (userId: string, task: Task) => {
    try {
        const ref = doc(db, "users", userId)
        const docSnap = await getDoc(ref)
        
        if (!docSnap.exists()) {
            throw new Error("User not found")
        }
        
        // Decrypt user
        const encryptedUser = docSnap.data()
        const user = decryptSimple(encryptedUser as EncryptedUserSimple)
        
        // Remove task
        user.tasks = user.tasks.filter(t => t.id !== task.id)
        
        // Re-encrypt and save
        const newEncryptedUser = encryptSimple(user)
        await setDoc(ref, newEncryptedUser)
        
        return true
    } catch (error) {
        console.error(error)
        throw new Error("Failed to remove task from user")
    }
}

export async function updateUserInDb(user: any) {
  try {
    const userRef = doc(db, "users", user.id);
    const encryptedUser = encryptSimple(user);
    await updateDoc(userRef, {
      ...encryptedUser
    });

    return true;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update user in database");
  }
}
export async function addNewUserkerToDb(user: User) {
  try {
    const userRef = doc(db, "users", user.id)
    const userSnap = await getDoc(userRef)
    const encryptedUser = encryptSimple(user);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        ...encryptedUser
      })
    }
    
    return true
  } catch (error) {
    console.log(error)
    throw new Error("Failed to add user to database")
  }
}
export const updateUser = async (user: User) => {
  try {
    const encryptedUser = encryptSimple(user) // or encrypt(user) depending on your approach
    const ref = doc(db, "users", user.id)
    await setDoc(ref, encryptedUser)
    return true
  } catch (error) {
    throw new Error("Failed to update user")
  }
}

import { ProductOption } from "@/lib/types"

export async function saveProductsToEmployee(
  employeeId: string,
  products: ProductOption[]
) {
  try {
    const employeeRef = doc(db, "employees", employeeId)

    await updateDoc(employeeRef, {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        subOptions: product.subOptions,
      })),
    })

    console.log("✅ Products updated for employee")
  } catch (error) {
    console.error("❌ Error updating employee products:", error)
  }
}

export async function getProductsFromDB(  employeeId: string): Promise<ProductOption[]> {
  try {
    const employeeRef = doc(db, "employees", employeeId)
    const snapshot = await getDoc(employeeRef)

    if (!snapshot.exists()) {
      console.warn("⚠️ Employee not found")
      return []
    }

    const data = snapshot.data()

    return (data.products ?? []).map((product: ProductOption) => ({
      id: product.id,
      name: product.name,
      subOptions: product.subOptions ?? [],
    }))
  } catch (error) {
    console.error("❌ Error fetching employee products:", error)
    return []
  }
}


export async function updateSubOption(
  employeeId: string,
  productId: string,
  updatedSubOption: subOptionsInterface
) {
  try {
    const employeeRef = doc(db, "employees", employeeId)
    const snapshot = await getDoc(employeeRef)

    if (!snapshot.exists()) return

    const data = snapshot.data()

    const updatedProducts = (data.products ?? []).map((product: ProductOption) => {
      if (product.id !== productId) return product

      return {
        ...product,
        subOptions: (product.subOptions ?? []).map(
          (sub: subOptionsInterface) =>
            sub.id === updatedSubOption.id ? updatedSubOption : sub
        ),
      }
    })

    await updateDoc(employeeRef, {
      products: updatedProducts,
    })
  } catch (err) {
    console.error("❌ Error updating sub option:", err)
  }
}

export async function removeProductFromDB (employeeId: string,
productId: string) {
  try {
    const employeeRef = doc(db, "employees", employeeId)
    const snapshot = await getDoc(employeeRef)

    if (!snapshot.exists()) return

    const data = snapshot.data()

    const filteredProducts = (data.products ?? []).filter(
      (product: ProductOption) => product.id !== productId
    )

    await updateDoc(employeeRef, {
      products: filteredProducts,
    })
  } catch (err) {
    console.error("❌ Error removing product:", err)
  }
}
export async function removeSubOptionFromDB(
  employeeId: string,
  productId: string,
  subOptionId: string
) {
  try {
    const employeeRef = doc(db, "employees", employeeId)
    const snapshot = await getDoc(employeeRef)

    if (!snapshot.exists()) return

    const data = snapshot.data()

    const updatedProducts = (data.products ?? []).map((product: ProductOption) => {
      if (product.id !== productId) return product

      return {
        ...product,
        subOptions: (product.subOptions ?? []).filter(
          (sub: subOptionsInterface) => sub.id !== subOptionId
        ),
      }
    })

    await updateDoc(employeeRef, {
      products: updatedProducts,
    })
  } catch (err) {
    console.error("❌ Error removing sub option:", err)
  }
}
