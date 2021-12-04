import api from '../../utils/api'

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

import styles from './Home.module.css'

function Home() {
  const [pets, setPets] = useState([])

  useEffect(() => {
    api.get('/pets').then((response) => {
      setPets(response.data.pets)
    })
  }, [])

  return (
    <section>
      <div className={styles.pet_home_header}>
        <h1>Hey! What about adopting a pet?</h1>
        <p>Log in and see details of each one and meet their tutor.</p>
      </div>
      <div className={styles.pet_container}>
        {pets.length > 0 &&
          pets.map((pet) => (
            <div className={styles.pet_card} key={pet._id}>
              <div
                style={{
                  backgroundImage: `url(${process.env.REACT_APP_API}/images/pets/${pet.images[0]})`,
                }}
                className={styles.pet_card_image}
              ></div>
              <h3>{pet.name}</h3>
              <p>
                <span className="bold">Weight:</span> {pet.weight}kg
              </p>
              {pet.available ? (
                <Link to={`/pet/${pet._id}`}>More details</Link>
              ) : (
                <p className={styles.adopted_text}>Adopted!</p>
              )}
            </div>
          ))}
        {pets.length === 0 && (
          <p>There are no pets registered or available for adoption at the moment!</p>
        )}
      </div>
    </section>
  )
}

export default Home
