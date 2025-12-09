import { useEffect, useState } from "react";
import "@/pages/Chat/Chat.css";
import { Navigation } from "@/components";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router";

function Chat() {
  const { user } = useSession();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);

  const fetchChats = async () => {};

  useEffect(() => {
    if (!user || !user.userId) navigate("/login");
  }, [user]);

  return (
    <>
      <Navigation />
      <div className="chat-page">
        <div className="chat-container">
          <div className="sidebar">
            <div className="sidebar-header">Project Chats</div>
            <div className="contact-list">
              <div className="contact-item active">
                <img
                  className="avatar"
                  src="https://placehold.co/44x44/3b82f6/ffffff?text=F"
                  onError={(e) =>
                    (e.target.src =
                      "https://placehold.co/44x44/3b82f6/ffffff?text=F")
                  }
                  alt="Freelancer Avatar"
                />
                <div className="contact-info">
                  <div className="contact-name">(Freelancer)</div>
                  <div className="contact-status">
                    Project: Website Redesign
                  </div>
                </div>
              </div>

              <div className="contact-item">
                <img
                  className="avatar"
                  src="https://placehold.co/44x44/10b981/ffffff?text=M"
                  onError={(e) =>
                    (e.target.src =
                      "https://placehold.co/44x44/10b981/ffffff?text=M")
                  }
                  alt="Client Avatar"
                />
                <div className="contact-info">
                  <div className="contact-name">(Client)</div>
                  <div className="contact-status">Project: Logo Design</div>
                </div>
              </div>

              <div className="contact-item">
                <img
                  className="avatar"
                  src="https://placehold.co/44x44/f97316/ffffff?text=D"
                  onError={(e) =>
                    (e.target.src =
                      "https://placehold.co/44x44/f97316/ffffff?text=D")
                  }
                  alt="Freelancer Avatar"
                />
                <div className="contact-info">
                  <div className="contact-name">(Freelancer)</div>
                  <div className="contact-status">Project: SEO Audit</div>
                </div>
              </div>
            </div>
          </div>

          <div className="chat-area">
            <div className="chat-header">
              <img
                className="avatar"
                src="https://placehold.co/50x50/3b82f6/ffffff?text=F"
                onError={(e) =>
                  (e.target.src =
                    "https://placehold.co/50x50/3b82f6/ffffff?text=F")
                }
                alt="Active Contact Avatar"
              />
              <div className="contact-info">
                <div className="contact-name">freelancer</div>
                <div className="contact-status">
                  Currently working on the wireframes...
                </div>
              </div>
            </div>

            <div className="message-area">
              <div className="message freelancer">
                <div className="message-bubble">
                  <p>
                    Hi there! I've reviewed the scope for the website redesign
                    project. I think we should start with a deep dive on user
                    experience and wireframes.
                  </p>
                  <span className="timestamp">10:05 AM</span>
                </div>
              </div>

              <div className="message client">
                <div className="message-bubble">
                  <p>
                    That sounds great, Alex. The main goal is to simplify the
                    checkout process and improve mobile performance. Do you need
                    any specific assets from me?
                  </p>
                  <span className="timestamp">10:07 AM</span>
                </div>
              </div>

              <div className="message freelancer">
                <div className="message-bubble">
                  <p>
                    Could you please share your current brand style guide and
                    any existing analytics data? That would be immensely helpful
                    for the initial phase.
                  </p>
                  <span className="timestamp">10:15 AM</span>
                </div>
              </div>

              <div className="message client">
                <div className="message-bubble">
                  <p>
                    Done! I just uploaded them to the project files section. Let
                    me know when you've had a chance to look it over.
                  </p>
                  <span className="timestamp">10:20 AM</span>
                </div>
              </div>
            </div>

            <div className="chat-input">
              <input type="text" placeholder="Type your message here..." />
              <button>Send</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
