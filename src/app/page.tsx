"use client"

import { NoSsr } from "@mui/base"
import { useState, useEffect } from 'react'
import styles from "./page.module.css";
import { Grid, TextField, Button } from '@mui/material';
import { collection, doc, addDoc, deleteDoc, query, onSnapshot } from "firebase/firestore"; 
import { db } from './firebase'

interface PantryItem {
  id: string,
  name: string,
  quantity: number
}

export default function Home() {
  const [items, setItems] = useState<PantryItem[]>([
    // { name: "Cookies", quantity: 10 },
    // { name: "Lays Potato Chips", quantity: 1 },
    // { name: "Plastic Cups", quantity: 25 }
  ])

  const [nameInput, setNameInput] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState<string>("");

  // Add items to database

  const addItem = async(e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (quantityInput !== '' && nameInput !== '') {
      if (!isNaN(+quantityInput)) {
        //setItems([...items, {name: nameInput, quantity: +quantityInput}])
        await addDoc(collection(db, 'items'), {
          name: nameInput.trim(),
          quantity: +quantityInput
        })
        .then(() => {
          setNameInput('');
          setQuantityInput('')
        })
      }
    }
    
  }

  // Delete items from database

  const deleteItem = async(id: string) => {
    await deleteDoc(doc(db, "items", id));
  }

  // Read items from database

  useEffect(() => {
    const q = query(collection(db, 'items'));
    onSnapshot(q, (querySnapshot) => {
      let itemsArr : PantryItem[] = [];

      querySnapshot.forEach((doc) => {

        itemsArr.push({
            id: doc.id, 
            // Guaranteed that doc.data() will come in the form name, quantity
            ...(doc.data() as {name: string, quantity: number}
          )
        })
      })
      setItems(itemsArr);
    })
  }, [])

  return (
    <main className={styles.main}>
      <h1>Pantry Tracker</h1>

      <div className={styles.pantry}>
        <div className={styles.pantryHeader}>
          <NoSsr>
            <Grid container spacing={2}>
              <Grid item xs={7}>
                <TextField value={nameInput} onChange={(e) => setNameInput(e.target.value)} fullWidth id="pantry-name" label="Item" variant="filled"/>
              </Grid>
              <Grid item xs={3}>
                <TextField value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} fullWidth id="pantry-quantity" label="Quantity" variant="filled"/>
              </Grid>
              <Grid container item xs={2}>
                <Button fullWidth variant="contained" onClick={addItem}>Add</Button>
              </Grid>
            </Grid>
          </NoSsr>

        </div>

        <div className={styles.pantryBody}>
        
        {
          items.map(item => (
              <Grid key={item.id} className={styles.pantryElement} container spacing={2}>
                <Grid container item xs={11}>
                  <p className={styles.pantryTest}>{item.name} ({item.quantity}x)</p>
                </Grid>
                <Grid container item xs={1}>
                  <Button onClick={() => deleteItem(item.id)} fullWidth variant="contained"></Button>
                </Grid>
              </Grid>


          ))
        }
        </div>

      </div>
    </main>
  );
}
