const Task = ({taskText, onClick}) => {
  return (
    <div>
      <span style={{marginRight: "10px"}}>{taskText}</span>
      <button onClick={onClick}>Delete</button>
      <hr />
    </div>
  )
}

export default Task