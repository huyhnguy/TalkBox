import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserGear, faMessage, faUserXmark, faEye, faCrown } from '@fortawesome/free-solid-svg-icons'

export default function MemberDropDown({ user, profileFunction, kickFunction, adminFunction, admin, ownerFunction}) {
    const navigate = useNavigate();

    const handleMessage = (e) => {
        e.preventDefault();

        fetch('/api/dms/create', {
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
            navigate(route);
          })
          .catch(err => {
            console.log(err);
        })
    }

    return (
        <>
            <div id={`${user._id}-dropdown`} className="member-button-container invisible">
                <button onClick={(e) => {handleMessage(e)}} className="member-button">
                    <FontAwesomeIcon icon={faMessage}/>
                    <p style={{margin: 0}}>Message</p>
                </button>
                <button onClick={(e) => {profileFunction(e, user._id)}} className="member-button">
                    <FontAwesomeIcon icon={faEye}/>
                    <p style={{margin: 0}}>View profile</p>
                </button>
                { adminFunction &&
                    <button onClick={(e) => {
                        if (admin) {
                            adminFunction(e, user._id, "Remove admin");
                        } else {
                            adminFunction(e, user._id, "Make admin");
                        }
                    }} className="member-button">
                        <FontAwesomeIcon icon={faUserGear}/>
                        <p style={{margin: 0}}>{ admin ? "Remove admin" : "Make admin"}</p>
                    </button>
                }
                { ownerFunction &&
                    <button onClick={(e) => {ownerFunction(e, user._id)}} className="member-button-gold">
                        <FontAwesomeIcon icon={faCrown}/>
                        <p style={{margin: 0}}>Make owner</p>
                    </button>
                }
                { kickFunction &&
                    <button onClick={(e) => {kickFunction(e, user._id)}} className="member-button-red">
                        <FontAwesomeIcon icon={faUserXmark}/>
                        <p style={{margin: 0}}>Kick user</p>
                    </button>
                }
            </div>
        </>


    )
}