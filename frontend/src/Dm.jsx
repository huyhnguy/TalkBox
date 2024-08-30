import { useLocation, useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import Message from "./Message";
import ProfilePic from "./ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPaperPlane, faCirclePlus} from '@fortawesome/free-solid-svg-icons'
import FileMessageInput from "./FileMessageInput";

export default function Dm() {
    const {state} = useLocation();
    const { receiver, history } = state;

    const [messageHistory, setMessageHistory] = useState(history);
    const [base64Pic, setBase64Pic] = useState(null);

    const urlParams = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const messageHistoryDiv = document.querySelector(".message-history");
        if (messageHistoryDiv.lastChild) {
            messageHistoryDiv.lastChild.scrollIntoView();
        }
    }, [messageHistory]);

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
        console.log(file);

        const base64 = await convertToBase64(file);
        setBase64Pic(base64);
        console.log(base64);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(urlParams);
        
        fetch('http://localhost:3000/api/messages/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                new_message:  document.getElementById("new-message").value,
                conversation_id: urlParams.dmId
            })
          })
        .then(res => {
            if (res.ok) { return res.json() }
            const error = new Error(res.message);
            error.code = res.status;
            throw error
          })
        .then(res => {
            console.log(res);
            setMessageHistory(res.conversation.history);
            document.getElementById("new-message").value = "";
        })
        .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }

    return(
        <div className="dm-page">
            <div className="receiver-container">
                <ProfilePic imageSrc={receiver.profile_picture} size="2.5rem"/>
                <h1>{receiver.display_name}</h1>
            </div>
            <main className="message-history">
                { messageHistory && 
                    messageHistory.map(message => {
                        if (message.user._id === receiver._id) {
                            return(
                                <Message key={message._id} info={message} person="receiver" />
                            )
                        }
                        return(
                            <Message key={message._id} info={message} person="sender" />
                        )
                    })
                }
            </main>
            <form method="POST" className="message-form">
                <label htmlFor="message-files" >
                    <FontAwesomeIcon icon={faCirclePlus} style={{ height: "100%", color: "#007BFF", cursor: "pointer"}}/>
                </label>
                <input style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: '0px', height: '0px'}} id="message-files" type="file" accept="image/*" onChange={(e) => {handleFileUpload(e)}}/>
                <div style={{width: "100%"}}>
                { base64Pic &&
                    <FileMessageInput imgSrc={base64Pic} />
                }
                    <input type="text" id="new-message" required className="input" placeholder="Message"/>

                </div>
                <button type="submit" onClick={handleSubmit} className="submit" style={{ width: "auto", paddingInline: "1.5rem" }}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </form>
        </div>
    )
}