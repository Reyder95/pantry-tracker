"use client"

import { NoSsr } from "@mui/base"
import { useState, useEffect } from 'react'
import styles from "./page.module.css";
import { Grid, TextField, Button, Modal, Box, Typography } from '@mui/material';
import { collection, doc, addDoc, deleteDoc, query, onSnapshot, updateDoc } from "firebase/firestore"; 
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from '@mui/icons-material/Edit';
import { db } from './firebase'

interface PantryItem {
  id: string,
  name: string,
  quantity: number,
  edit: boolean
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "900px",
  bgcolor: 'grey',
  border: '5px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function Home() {
  const [items, setItems] = useState<PantryItem[]>([
    // { name: "Cookies", quantity: 10 },
    // { name: "Lays Potato Chips", quantity: 1 },
    // { name: "Plastic Cups", quantity: 25 }
  ])

  const [nameInput, setNameInput] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [pantryEditValue, setPantryEditValue] = useState<string>("");
  const [pantryEditQuant, setPantryEditQuant] = useState<string>("");
  const [pantryEditIndex, setPantryEditIndex] = useState<number>(-1);

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

  const editItem = (index: number) => {
    setPantryEditValue(items[index].name)
    setPantryEditQuant(String(items[index].quantity))
    setPantryEditIndex(index);
    setOpen(true);
  }

  const finalizeEdit = async() => {
    if (pantryEditIndex != -1) {
      const itemRef = doc(db, "items", items[pantryEditIndex].id)

      await updateDoc(itemRef, {
        name: pantryEditValue,
        quantity: pantryEditQuant
      })
      .then(() => {
        setOpen(false)
      })
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
            edit: false,
            // Guaranteed that doc.data() will come in the form name, quantity
            ...(doc.data() as {name: string, quantity: number})
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
            <Grid container spacing={2}>
              <Grid className={styles.searchBar} item xs={12}>
                <TextField value={searchInput} onChange={(e) => setSearchInput(e.target.value)} fullWidth id="pantry-search" label="Search For Items" variant="filled"/>
              </Grid>
            </Grid>
          </NoSsr>

        </div>

        <div className={styles.pantryBody}>
        
        {
          items.map((item, index) => {
            if (searchInput == "") {
              return (
                <Grid key={item.id} className={styles.pantryElement} container spacing={2}>
                  <Grid container item xs={9}>
                    <p className={styles.pantryTest}>{item.name} ({item.quantity}x)</p>
                  </Grid>
                  <Grid className={styles.gridButton} container item xs={1}>
                    <Button onClick={() => editItem(index)} fullWidth variant="contained"><EditIcon/></Button>
                  </Grid>
                  <Grid className={styles.gridButton} container item xs={1}>
                    <Button onClick={() => deleteItem(item.id)} fullWidth variant="contained"><DeleteIcon/></Button>
                  </Grid>
                </Grid>
              )
            }
            else
            {
              console.log(item.name.includes(searchInput))
              if (item.name.includes(searchInput))
              {
                return (
                  <Grid key={item.id} className={styles.pantryElement} container spacing={2}>
                  <Grid container item xs={9}>
                    <p className={styles.pantryTest}>{item.name} ({item.quantity}x)</p>
                  </Grid>
                  <Grid className={styles.gridButton} container item xs={1}>
                    <Button onClick={() => deleteItem(item.id)} fullWidth variant="contained"><EditIcon/></Button>
                  </Grid>
                  <Grid className={styles.gridButton} container item xs={1}>
                    <Button onClick={() => deleteItem(item.id)} fullWidth variant="contained"><DeleteIcon/></Button>
                  </Grid>
                </Grid>
                )

              }

            }
            }

          )
        }
        </div>

      </div>

      <Modal
      open={open}
      onClose={() => setOpen(false)}
      className={styles.modalStyle}
      >
        <Box sx={style} className={styles.modalStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Pantry Item
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
              <Grid item xs={7}>
                <TextField value={pantryEditValue} onChange={(e) => setPantryEditValue(e.target.value)} fullWidth id="pantry-name" label="Item" variant="filled"/>
              </Grid>
              <Grid item xs={3}>
                <TextField value={pantryEditQuant} onChange={(e) => setPantryEditQuant(e.target.value)} fullWidth id="pantry-quantity" label="Quantity" variant="filled"/>
              </Grid>
              <Grid container item xs={2}>
                <Button fullWidth variant="contained" onClick={finalizeEdit}>Edit</Button>
              </Grid>
            </Grid>
          </Typography>
        </Box>
      </Modal>
    </main>
  );
}
