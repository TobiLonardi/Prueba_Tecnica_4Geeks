export const initialStore=()=>{
  return{
    message: null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ],
    token: localStorage.getItem("token") || null,

    user: {
      id: 1,
      email: "",
    },
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };
      
    case 'add_task':

      const { id,  color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
       case "LOGIN":
      return {
        ...store,
        token: action.payload,
      };

    case "UPDATE_TOKEN":
      localStorage.getItem("token",action.payload)
      return{
        ...store,
        token:action.payload

      }
    case "LOGIN_USER":
      return {
        ...store,
        user: action.payload,
      };
      
    default:
      throw Error('Unknown action.');
  }    
}
