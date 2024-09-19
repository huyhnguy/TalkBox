import ProfilePic from "./ProfilePic"
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleLeft, faCircleRight, faCircleXmark, faSquarePlus} from '@fortawesome/free-solid-svg-icons'

export default function AddGroup({ closePopUp }) {
    const [base64Pic, setBase64Pic] = useState(null);
    const [usersList, setUsersList] = useState(null);
    const [chosenUsers, setChosenUsers] = useState([]);
    const [next, setNext] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3000/api/users', {
            method: 'GET',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          })
          .then(res => {
            if (res.ok) { return res.json() }
            const error = new Error(res.message);
            error.code = res.status;
            throw error
          })
          .then(res => {
            setUsersList(res);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

    useEffect(() => {
        const chosenUsersContainer = document.querySelector(".chosen-users");
        if (chosenUsersContainer) {
            chosenUsersContainer.lastChild.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: "smooth",
                alignToTop: false
              });
        }
    }, [chosenUsers]);

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file); 
            fileReader.onload = () => {
                resolve(fileReader.result)
            }
            fileReader.onerror = (error) => {
                reject(error)
            }
        })
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const base64 = await convertToBase64(file);
        setBase64Pic(base64);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const groupName = document.getElementById("group-name").value;
        const groupPic = document.getElementById("group-picture").files[0]
        const chosenUsersIds = Array.from(chosenUsers, user => user._id)

        const formData = new FormData();
        formData.append("display_name", groupName);
        formData.append("group_picture", groupPic);
        
        for (let i = 0; i < chosenUsersIds.length; i++) {
            formData.append(`users[${i}]`, chosenUsersIds[i]);
          }
          
        
        fetch('http://localhost:3000/api/groups/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
            },
            body: formData
          })
          .then(res => res.json())
          .then(res => {
            console.log(res.conversation);
            closePopUp("completed");
          })
          .catch(err => {
            console.log(err);
        })

    }

    const handleCheckbox = (e) => {
        const inputId = e.target.id
        const label = document.getElementById(inputId + "-label");
        if (e.target.checked) {
            label.classList.add("selected-user");
            const newChosenUser = usersList.find(user => user._id === inputId)
            setChosenUsers([...chosenUsers, newChosenUser])
        } else {
            label.classList.remove("selected-user");
            const newArray = chosenUsers.filter(user => user._id != e.target.id);
            setChosenUsers(newArray);
        }
    }

    const handleDeleteUser = (userId) => {
        const label = document.getElementById(userId + "-label");
        label.classList.remove("selected-user");
        const newArray = chosenUsers.filter(user => user._id != userId);
        setChosenUsers(newArray);
    }

    const handleSearch = (e) => {
        let value = e.target.value.toLowerCase();
        
        usersList.forEach(user => {
          const isVisible = user.display_name.toLowerCase().includes(value);
          const userCard = document.getElementById(`card-${user._id}`);
          userCard.classList.toggle("hide", !isVisible);
        })
      }

    return(
        <>
            <div className="shadow" onClick={() => {closePopUp("close")}}></div>
            <div className="add-group-container">
                { !next ?
                    <>
                        <h1>Add Users</h1>
                        <button className="next-button" onClick={() => {setNext(true)}}>
                            <FontAwesomeIcon icon={faCircleRight} className="next-icon"/>
                        </button>
                        <input type="search" placeholder="Search name" className="user-list-search" onChange={(e) => handleSearch(e)} style={{ width: "100%", marginBottom: "1rem" }}></input>
                        <form action="" method="POST">
                            <section className="add-users-section">
                                { chosenUsers.length > 0 &&
                                    <div className="chosen-users">
                                        {chosenUsers.map(user => 
                                            <div className="chosen-user-card" key={user._id}>
                                                <div style={{position: "relative"}}>
                                                    <ProfilePic imageSrc={user.profile_picture} size="3rem"/>
                                                    <button className="x-button" onClick={() => {handleDeleteUser(user._id)}}>
                                                        <FontAwesomeIcon icon={faCircleXmark} className="x-icon"/>
                                                    </button>
                                                </div>
                                                <p>{user.display_name}</p>
            
                                            </div>
                                        )}
                                    </div>
                                }
                                <div className="form-user-list">
                                    { usersList &&
                                        usersList.map(user => {
                                            return(
                                                <div key={user._id} id={`card-${user._id}`}>
                                                    <label className={`user-card ${chosenUsers.includes(user) && 'selected-user'}`} htmlFor={user._id} id={user._id + "-label"}>
                                                        <ProfilePic imageSrc={user.profile_picture} size="3rem"/>
                                                        <p>{user.display_name}</p>
                                                    </label>
                                                    <input type="checkbox" id={user._id} name={user._id} value={user._id} style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: '0px', height: '0px'}} onChange={(e) => {handleCheckbox(e)}} checked={chosenUsers.includes(user) ? true : false}/>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </section>
                        </form>
                    </>
                    :
                    <>
                        <h1>New Group</h1>
                        <button className="back-button" onClick={() => {setNext(false)}}>
                            <FontAwesomeIcon icon={faCircleLeft} className="next-icon"/>
                        </button>
                        <button className="next-button" onClick={handleSubmit}>
                            <FontAwesomeIcon icon={faSquarePlus} className="next-icon"/>
                        </button>
                        <form action="" method="POST">
                            <section className="picture-section">
                                { base64Pic ?
                                    <ProfilePic imageSrc={base64Pic} size="10rem"/>
                                    :
                                    <ProfilePic size="10rem" group={true}/>
                                }
                                <label htmlFor="profile-picture" style={{ alignSelf: "start" }}>Group Picture <span style={{color: "grey"}}>(optional)</span></label>
                                <input style={{ cursor: "pointer" }} className="input" type="file" id="group-picture" accept="image/*" onChange={(e) => {handleFileUpload(e)}}/>
                            </section>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label htmlFor="group-name">Group Name <span style={{color: "grey"}}>(optional)</span></label>
                                <input className="input" id="group-name" type="text" />
                            </div>
                        </form>
                    </>         
                }

            </div>
        </>
    )
}