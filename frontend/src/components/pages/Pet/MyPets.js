import api from '../../../utils/api'
import axios from 'axios'

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

import styles from './Dashboard.module.css'

import RoundedImage from '../../layout/RoundedImage'

/* hooks */
import useFlashMessage from '../../../hooks/useFlashMessage'

function MyPets() {
    const [pets, setPets] = useState([])
    const [token] = useState(localStorage.getItem('token') || '')
    const { setFlashMessage } = useFlashMessage()

    useEffect(() => {
        api
            .get('/pets/mypets', {
                headers: {
                    Authorization: `Bearer ${JSON.parse(token)}`,
                },
            })
            .then((response) => {
                setPets(response.data.pets)
            })
    }, [token])

    async function removePet(id) {
        let msgType = 'success'

        const data = await api
            .delete(`/pets/${id}`, {
                headers: {
                    Authorization: `Bearer ${JSON.parse(token)}`,
                },
            })
            .then((response) => {
                const updatedPets = pets.filter((pet) => pet._id !== id)
                setPets(updatedPets)
                return response.data
            })
            .catch((err) => {
                console.log(err)
                msgType = 'error'
                return err.response.data
            })

        setFlashMessage(data.message, msgType)
    }
    // piece of code to conclude the adoption as the others options didn't received the token back
    // token verification ** need to change the url after deploy ** mudar a url na api, aqui e api.js
    async function concludeAdoption(id) {
        let msgType = 'success'
        console.log(token)

        const data = await axios({ method: 'patch', url: `http://localhost:5000/pets/conclude/${id}`, headers: { 'Authorization': 'Bearer ' + JSON.parse(token) } })
            .then((response) => {
                return response.data
            })
            .catch((err) => {
                console.log(err)
                msgType = 'error'
                return err.response.data
            })

        setFlashMessage(data.message, msgType)
    }

    return (
        <section>
          <div className={styles.petslist_header}>
            <h1>My registered pets</h1>
            <Link to="/pet/add">Register Pet</Link>
          </div>
          <div className={styles.petslist_container}>
            {pets.length > 0 &&
              pets.map((pet) => (
                <div key={pet._id} className={styles.petlist_row}>
                  <RoundedImage
                    src={`${process.env.REACT_APP_API}/images/pets/${pet.images[0]}`}
                    alt={pet.name}
                    width="px75"
                  />
                  <span className="bold">{pet.name}</span>
                  <div className={styles.actions}>
                    {pet.available ? (
                      <>
                        {pet.adopter && (
                          <button
                            className={styles.conclude_btn}
                            onClick={() => {
                              concludeAdoption(pet._id)
                            }}
                          >
                            Complete adoption
                          </button>
                        )}
    
                        <Link to={`/pet/edit/${pet._id}`}>Edit</Link>
                        <button
                          onClick={() => {
                            removePet(pet._id)
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <p>Pet already adopted</p>
                    )}
                  </div>
                </div>
              ))}
            {pets.length === 0 && <p>No pets registered yet!</p>}
          </div>
        </section>
      )
    }
    
    export default MyPets