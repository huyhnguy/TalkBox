import NavBar from "./NavBar"
import { useState } from "react"
import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import ProfilePic from "./ProfilePic";
import { useNavigate, useParams } from "react-router-dom";
import MemberDropDown from "./MemberDropDown";
import UserProfile from "./UserProfile";

export default function GroupSettings() {
    const [displayName, setDisplayName] = useState(undefined);
    const [pic, setPic] = useState(null);
    const [users, setUsers] = useState(null);
    const [dropDown, setDropDown] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [errors, setErrors] = useState(null);

    const urlParams = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/settings`, {
            method: 'GET',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          })
          .then(res => {
            if (res.ok) { return res.json() }
            const error = new Error(res.message);
            error.code = res.status;
            throw error
          })
          .then(res => {
            console.log(res);
            setDisplayName(res.group.display_name);
            setPic(res.group.profile_picture);
            setUsers(res.group.users);

          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

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
        if (guest) {
            e.preventDefault();
            return
        }
        const file = e.target.files[0];
        const base64 = await convertToBase64(file);
        setPic(base64);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const newDisplayName = document.getElementById("display-name").value;

        const formData = new FormData();
        formData.append("display_name", newDisplayName);

        if (!pic && !document.getElementById("profile-picture").files[0]) {
            // no previous picture and no picturer uploaded
            formData.append("profile_picture", null);
            formData.append("picture_status", "delete")
        } else if (pic && document.getElementById("profile-picture").files[0]) { 
            //if the user doesn't have a picture yet and they upload a picture
            const profilePic = document.getElementById("profile-picture").files[0];
            formData.append("profile_picture", profilePic);
        } else if (pic && !document.getElementById("profile-picture").files[0]) {
            //if the user does have a picture and they dont upload any picture, dont do anything
            formData.append("profile_picture", null);
        }

        fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/settings`, {
            method: 'PUT',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
            },
            body: formData
          })
          .then(res => res.json())
          .then(res => {
            if (res.errors) {
                const displayNameErrors = res.errors.filter(error => error.path === "display_name");
                setErrors({
                    display_name: displayNameErrors[0],
                })
            } else {
                console.log(res);
                alert(res.message);
                setErrors(null);
            }
          })
          .catch(err => {
            console.log(err);
        })

    }

    const handleDropdown = (userId) => {
        console.log(document.getElementById(`${userId}-dropdown`));
        const currentDropdown = document.getElementById(`${userId}-dropdown`);
        
        if (currentDropdown.classList.contains('invisible')) {
            currentDropdown.classList.remove('invisible');
            if (dropDown) {
                const previousDropDown = document.getElementById(`${dropDown}-dropdown`);
                previousDropDown.classList.add('invisible');
            }
            setDropDown(userId)
        } 
    }

    const closeDropDown = () => {
        const previousDropDown = document.getElementById(`${dropDown}-dropdown`);
        previousDropDown.classList.add('invisible');
        setDropDown(null);

        console.log('closedropdown function');
    }

    const openUserProfile = (e, userId) => {
        e.preventDefault();
        console.log('openuserprofile function');
        setUserProfile(userId);
        closeDropDown();
    }


    return(
        <div className="settings-page">
            { dropDown &&
                <div style={{ height: "100vh", width: "100vw", position: "absolute", zIndex: "98",}} onClick={closeDropDown}></div>
            }
            { userProfile &&
                <>
                    <div className="shadow" onClick={() => {
                        setUserProfile(null);
                        closeDropDown();
                        }}></div>
                    <UserProfile userId={userProfile} />
                </>
            }
            <div className="settings-container">
                <div className="settings-card">
                    <h1 style={{margin: "0 0 1rem 0"}}>Group Settings</h1>
                    <form action="" method="PUT">
                        <div className="form-section">
                            <div style={{position: "relative"}} className="pic-container-x">
                                { pic ?
                                    <>
                                        <label htmlFor="profile-picture" style={{ cursor: "pointer" }}>
                                            <ProfilePic imageSrc={pic} size="10rem"/>
                                        </label>
                                        <button className="x-button-pfp" onClick={(e) => {
                                            e.preventDefault();
                                            setPic(null);
                                        }}>
                                            <FontAwesomeIcon icon={faCircleXmark} className="x-icon" style={{height: "3rem"}}/>
                                        </button>
                                    </>
                                    :
                                    <label htmlFor="profile-picture" style={{ cursor: "pointer" }}>
                                        <ProfilePic size="10rem"/>
                                    </label>
                                }
                            </div>
                            <label htmlFor="profile-picture" style={{ alignSelf: "start" }}>Profile Picture </label>
                            <input style={{ cursor: "pointer", color: "grey" }} className="input" type="file" id="profile-picture" name="profile-picture" accept="image/*" defaultValue={ pic && pic } onChange={(e) => {handleFileUpload(e)}}/>
                        </div>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <label htmlFor="display-name">Display Name</label>
                            <div className="input-containers">
                                <input className="input" id="display-name" type="text" defaultValue={displayName} style={{ borderColor: errors && errors.display_name && "red" }}/>
                                { errors && errors.display_name &&
                                    <p className="error-message">{errors.display_name.msg}</p>
                                }
                            </div>
                        </div>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <p style={{ margin: 0 }}>Admin Permissions</p>
                            <div className="form-section-container">
                                <div className="checkbox-container">
                                    <label htmlFor="delete-messages">Can delete messages</label>
                                    <input  id="delete-messages" name="admin-permissionss" value="delete-messages" type="checkbox" />
                                </div>
                                <div className="checkbox-container">
                                    <label htmlFor="invite-users">Can invite users</label>
                                    <input  id="invite-users" name="admin-permissions" value="invite-users" type="checkbox" defaultChecked/>
                                </div>
                                <div className="checkbox-container">
                                    <label htmlFor="kick-users">Can kick users</label>
                                    <input  id="kick-users" name="admin-permissions" value="kick-users" type="checkbox" />
                                </div>
                            </div>
                        </div>
                        <button className="submit" onClick={handleSubmit}>Save</button>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <p style={{ margin: 0 }}>Members</p>
                            <div className="members-container">
                                { users &&
                                    users.map((user) => {
                                        return (
                                            <div key={user._id} style={{position: "relative"}} onClick={() => {handleDropdown(user._id)}}>
                                                <div >
                                                    <div className="member-card" >
                                                        <ProfilePic imageSrc={user.profile_picture} size="4rem"/>
                                                        <div className="name-message">
                                                            <h2>{user.display_name}</h2>
                                                        </div>
                                                    </div>
                                                    <hr style={{ margin: 0 }}/>
                                                </div>
                                                
                                                <MemberDropDown user={user} profileFunction={openUserProfile}/>
                  
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <button className="submit" style={{backgroundColor: "red"}}>Delete Group</button>
                        <button className="submit" style={{backgroundColor: "red"}}>Leave Group</button>
                    </form>
                </div>
            </div>
            <NavBar active='Groups' />
        </div>
    )
}