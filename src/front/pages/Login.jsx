import { useState } from "react"
import { Link, useNavigate, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"

const initialStateUser = {
    email: "",
    password: ""
}

export const Login = () => {
    const [user, setUser] = useState(initialStateUser)

    const { dispatch, store } = useGlobalReducer()
    const navigate = useNavigate()

    const handleChange = ({ target }) => {
        setUser({
            ...user,
            [target.name]: target.value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const url = import.meta.env.VITE_BACKEND_URL
        const response = await fetch(`${url}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
        const data = await response.json()

        if (response.ok) {
            localStorage.setItem("token", data.token)
            dispatch({ type: "LOGIN", payload: data.token })
            dispatch({ type: "LOGIN_USER", payload: data.user })
            console.log(store.user)
            setTimeout(() => {
                //navigate("/menu")
            }, 2000)
        }
        else if (response.status === 400) {
            alert("Credenciales incorrectas");
        }
        else {
            alert("Error inesperado")
        }
    }
    //if (store.token) {
      //  return <Navigate to="/menu" />
    //}

    return (
        <div className="container-fluid vh-100">
            <div className="row justify-content-center my-5">
                <h2 className="text-center my-3 fw-bold">Ingresar a la plataforma</h2>
                <div className="col-12 col-md-6 border rounded-4 py-4 bg-dark" >
                    <form
                        className=" m-2 p-3"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group mb-3 text-light">
                            <label htmlFor="btnEmail">Correo electronico: </label>
                            <input
                                type="text"
                                placeholder="JhonDoe@email.com"
                                className="form-control"
                                id="btnEmail"
                                name="email"
                                onChange={handleChange}
                                value={user.email}
                            />
                        </div>
                        <div className="form-group mb-3 text-light">
                            <label htmlFor="btnPass">Contraseña: </label>
                            <input
                                type="password"
                                placeholder="password"
                                className="form-control"
                                id="btnPass"
                                name="password"
                                onChange={handleChange}
                                value={user.password}
                            />
                        </div>
                        <button
                            className="btn btn-outline-light w-100"
                        >Inicia Sesión</button>
                    </form>
                </div>
                <div className="w-100"></div>
                <div className="col-12 col-md-6  d-flex justify-content-between my-1 px-4 ">
                    <Link to="/register">Registrarme</Link>
                    <Link to="/recovery-password">Recuperar contraseña</Link>
                </div>
            </div>
        </div>
    )
}