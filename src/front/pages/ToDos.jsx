import React from "react";
import { useState, useEffect } from "react";
import storeReducer from "../store";
import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer"


//include images into your bundle

//create your first component
export const ToDos = () => {

	const [task, setTask] = useState("")

	const [toDos, setToDos] = useState([]);

	const { dispatch, store } = useGlobalReducer()

	const url = import.meta.env.VITE_BACKEND_URL

	const token = localStorage.getItem("token")

	const [editingId, setEditingId] = useState(null);
	const [editingText, setEditingText] = useState("");

	const startEditing = (todo) => {
		setEditingId(todo.id);
		setEditingText(todo.label);
	};




	useEffect(() => {
		getToDos();
	}, []);

	const getToDos = async () => {
		const response = await fetch(`${url}/api/tasks`, {
			headers: { "Authorization": `Bearer ${token}` }
		});
		if (response.ok) {
			const data = await response.json();
			setToDos(data);
		}
	};

	const addToList = async (event) => {
		if (event.key === "Enter" && task.trim() !== "") {
			const response = await fetch(`${url}/api/tasks`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify({ label: task })
			});

			if (response.ok) {
				setTask("");
				getToDos();
			}
		}
	};

	const eliminateElement = async (id) => {
		const response = await fetch(`${url}/api/tasks/${id}`, {
			method: "DELETE",
			headers: { "Authorization": `Bearer ${token}` }
		});

		if (response.ok) {
			setToDos(toDos.filter((item) => item.id !== id));
		}
	};

	const toggleComplete = async (todo) => {
		const response = await fetch(`${url}/api/tasks_done/${todo.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify({ completed: !todo.completed })
		});

		if (response.ok) {
			// Actualizar el estado local sin necesidad de recargar todo
			setToDos(toDos.map(item =>
				item.id === todo.id ? { ...item, completed: !item.completed } : item
			));
		}
	};

	const saveEdit = async (todo) => {
		const response = await fetch(`${url}/api/tasks/${todo.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify({ label: editingText })  
		});

		if (response.ok) {
			setToDos(toDos.map(item =>
				item.id === todo.id ? { ...item, label: editingText } : item
			));
			setEditingId(null);
		}
	};

	const logOut = async (event) => {

		const response = await fetch(`${url}/api/logout`, {
			method: "POST",
			headers: {
				//"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
		})

		dispatch({ type: "UPDATE_TOKEN", payload: null })
	}

	if (!store.token || token == null) {
		localStorage.removeItem("token")
		return <Navigate to={"/login"} />
	}
	return (
		<div className="container py-5  ">
			<div className="row justify-content-center">
				<h1 className="text-center text-body-secondary">
					todos
				</h1>
				<div className="col-12 col-md-7 shadow bg-body-tertiary p-0 m-0">
					<form action="" className="bg-body-tertiary" onSubmit={(event) => event.preventDefault()}>
						<input type="text"
							placeholder="What needs to be done?"
							className="form-control form-control-lg  bg-body-tertiary text-body-secondary"
							name="task"
							onChange={(e) => setTask(e.target.value)}
							value={task}
							onKeyDown={addToList}
						/>
					</form>
					<ul className="">
						{
							toDos.map((todo) => {
								return (
									<li
										key={todo.id}
										className={`border rounded text-body-secondary `}
									>
										{editingId === todo.id ? (
											<input
												type="text"
												value={editingText}
												onChange={(e) => setEditingText(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") saveEdit(todo);
													if (e.key === "Escape") setEditingId(null); // cancelar edición
												}}
												autoFocus
											/>
										) : (
											<div onClick={() => {startEditing(todo);}} 
											className={`${todo.completed ? "text-decoration-line-through" : ""}`}>{todo.label}</div>
										)}

										<span>
											<i
												className="fa-solid fa-check m-3"
												onClick={(e) => {
													e.stopPropagation();
													toggleComplete(todo);
												}}
											></i>

											<i
												className="fa-solid fa-xmark m-1"
												onClick={(e) => {
													e.stopPropagation();
													eliminateElement(todo.id);
												}}
											></i>
										</span>
									</li>
								)
							})
						}
					</ul>
					<div className="d-flex justify-content-start align-items-center border rounded p-1">
						<h6 className="text-center text-body-secondary">item left {toDos.length}</h6>

					</div>

				</div>
				<button type="button" class="btn btn-danger w-50 m-5" onClick={logOut}>LogOut</button>

			</div>

		</div>

	);
};