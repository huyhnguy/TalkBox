import { useState } from "react"
import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMessage } from '@fortawesome/free-solid-svg-icons'
import ProfilePic from "./ProfilePic";
import { useNavigate } from "react-router-dom";

export default function UserProfile({ userId }) {
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3000/api/users/' + userId, {
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
            setUser(res);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

    const convertDate = (date) => {
        if (!date) {
            return "N/A"
        }

        const readableDate = new Date(date);
        let options = {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
        const formatter = new Intl.DateTimeFormat("en-US", options);
        const formattedDate = formatter.format(readableDate, options);

        return formattedDate
    
    }

    const handleDM = (user) => {

        fetch('http://localhost:3000/api/dms/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                other_user_id: user._id
            })
          })
          .then(res => res.json())
          .then(res => {
            const route = `/dms/${res.dm._id}`;
            navigate(route, { state: {
                receiver: user,
                history: res.dm.history
            } });
          })
          .catch(err => {
            console.log(err);
            navigate('/login');
        })
    }

    return(
            <div className="user-profile-container">
                { user &&
                    <>
                        <ProfilePic imageSrc={user.profile_picture} size="10rem" style={{ flexShrink: "0" }}/>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                                <h1 style={{ margin: 0 }}>{user.display_name}</h1>
                                <button className={'submit message-button'} onClick={() => {handleDM(user)}}>
                                    <FontAwesomeIcon icon={faMessage} style={{ height: "1rem" }}/>
                                    <p style={{ margin: 0 }}>Message</p>
                                </button>
                            </div>
                            <p>{user.about_me} user aboue me user aboue me user aboue me user aboue me user aboue me</p>
                            <p>Member since: {convertDate(user.createdAt)}</p>
                        </div>

                    </>
                }
            </div>
    )
}