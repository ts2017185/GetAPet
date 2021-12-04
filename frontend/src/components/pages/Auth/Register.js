import { useState, useContext } from 'react'
import Input from '../../form/Input'
import { Link } from 'react-router-dom'

import styles from '../../form/Form.module.css'

/* contexts */
import { Context } from '../../../context/UserContext'

function Register() {
  const [user, setUser] = useState({})
  const { register } = useContext(Context)

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    register(user)
  }

  return (
    <section className={styles.form_container}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <Input
          text="Name"
          type="text"
          name="name"
          placeholder="Type your name"
          handleOnChange={handleChange}
        />
        <Input
          text="Phone number"
          type="text"
          name="phone"
          placeholder="Insert your phone number"
          handleOnChange={handleChange}
        />
        <Input
          text="Email"
          type="email"
          name="email"
          placeholder="Insert your email"
          handleOnChange={handleChange}
        />
        <Input
          text="Password"
          type="password"
          name="password"
          placeholder="Enter a password"
          handleOnChange={handleChange}
        />
        <Input
          text="Confirm the password"
          type="password"
          name="confirmpassword"
          placeholder="Confirm the password"
          handleOnChange={handleChange}
        />
        <input type="submit" value="Register" />
      </form>
      <p>
      Already have an account? <Link to="/login">Click here.</Link>
      </p>
    </section>
  )
}

export default Register
