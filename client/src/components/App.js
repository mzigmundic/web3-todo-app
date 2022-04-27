import { useState, useEffect } from "react";
import Task from "./Task";
import { TaskContractAddress } from "../config.js";
import { ethers } from "ethers";
import TaskAbi from "../utils/TaskContract.json";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [correctNetwork, setCorrectNetwork] = useState(false);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Metamask not detected");
        return;
      }

      let chainId = await ethereum.request({ method: "eth_chainId" });

      const rinkebyChainId = "0x4";

      if (chainId !== rinkebyChainId) {
        console.log("Not equal");
        return;
      } else {
        console.log("Current network true");
        setCorrectNetwork(true);
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllTasks = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );

        let allTasks = await TaskContract.getMyTasks();
        console.log(allTasks);
        setTasks(allTasks);
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    const task = {
      taskText: input,
      isDeleted: false,
    };

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );
        TaskContract.addTask(task.taskText, task.isDeleted)
          .then((response) => {
            setTasks([...tasks, task]);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } catch (error) {
      console.log(error);
    }
    setInput("");
  };

  const deleteTask = (key) => async () => {
    console.log(key);
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );

        await TaskContract.deleteTask(key, true);
        let allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    connectWallet();
    getAllTasks();
  }, []);

  return (
    <div>
      {currentAccount === "" ? (
        <button onClick={connectWallet}>Connect wallet</button>
      ) : correctNetwork ? (
        <div>
          <div style={{marginLeft: "40px"}}>
            <h2>Task manager</h2>
            <form>
              <input onChange={(e) => setInput(e.target.value)} />
              <button onClick={addTask}>Add task</button>
            </form>
          </div>
          <ul>
            {tasks.map((item) => (
              <Task
                key={item.id._hex}
                taskText={item.taskText}
                onClick={deleteTask(item.id)}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p>Please connect to the Rinkeby testnet and reload the page</p>
        </div>
      )}
    </div>
  );
}

export default App;
