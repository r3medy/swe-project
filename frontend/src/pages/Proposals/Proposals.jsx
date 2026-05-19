import "@/pages/Proposals/Proposals.css";
import { Navigation, SmallText, Status, Tooltip, Button } from "@/components";
import { useSession } from "@/contexts/useSession";
import { assetUrl } from "@/config";
import { get, put } from "@/utils/request";

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { LuCheck, LuX } from "react-icons/lu";

import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

function Proposals() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPostProposals = useCallback(async (postId) => {
    try {
      const { proposals } = await get(`/proposals/${postId}`);
      return proposals || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const responseData = await get("/profile/clientPosts/");
      const clientPosts = responseData?.clientPosts || [];

      const postsWithProposals = await Promise.all(
        clientPosts.map(async (post) => {
          const proposals = await fetchPostProposals(post.postId);
          return { ...post, proposals: proposals || [] };
        }),
      );

      setData(postsWithProposals);
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPostProposals]);

  const handleUpdateProposal = useCallback(
    async (postId, proposalId, action = "accept") => {
      try {
        const responseData = await put(
          `/proposals/${action}/${postId}/${proposalId}`,
        );
        if (responseData.success) {
          toast.success(
            `${responseData.message}, You will be redirected to the chat`,
          );
          navigate(`/chat`);
        } else {
          throw new Error(responseData.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (!user?.userId || user?.role === "Freelancer") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <>
      <Navigation />
      <div className="proposals-container">
        {isLoading ? (
          <Status
            text="Loading..."
            subtext="Please wait while we load your posts & proposals"
          />
        ) : !isLoading &&
          data?.every((post) => post?.proposals?.length === 0) ? (
          <Status.Error
            text="No proposals found"
            subtext="You have no proposals yet"
          />
        ) : (
          <>
            <div className="proposals-header">
              <h2>Proposals</h2>
              <SmallText text="Where you can view all the proposals submitted by freelancers to your posts" />
            </div>
            {data
              ?.filter((p) => p?.proposals?.length > 0)
              .map((post) => (
                <div key={post.postId} className="proposal-post">
                  <h3 className="proposal-post-title">{post.title}</h3>
                  {post.proposals.map((proposal) => (
                    <div key={proposal.proposalId} className="proposal-card">
                      <div className="proposal-card-left">
                        <img
                          src={
                            proposal.profilePicture
                              ? assetUrl(`/${proposal.profilePicture}`)
                              : proposal.gender === "Male"
                                ? profileImage1
                                : profileImage3
                          }
                          alt="Profile picture"
                          className="proposal-avatar"
                        />
                        <div className="proposal-user-info">
                          <p className="proposal-name">{`${proposal.firstName} ${proposal.lastName}`}</p>
                          <SmallText text={`@${proposal.username}`} />
                        </div>
                      </div>
                      <div className="proposal-card-content">
                        <p className="proposal-description">
                          {proposal.description}
                        </p>
                        <SmallText
                          text={`Sent At: ${new Date(
                            proposal.submittedAt,
                          ).toLocaleString()}`}
                        />
                      </div>
                      <div className="proposal-card-actions">
                        <Tooltip text="Accept">
                          <Button.Icon
                            onClick={() =>
                              handleUpdateProposal(
                                post.postId,
                                proposal.proposalId,
                                "accept",
                              )
                            }
                          >
                            <LuCheck />
                          </Button.Icon>
                        </Tooltip>
                        <Tooltip text="Decline">
                          <Button.Icon
                            onClick={() =>
                              handleUpdateProposal(
                                post.postId,
                                proposal.proposalId,
                                "decline",
                              )
                            }
                          >
                            <LuX />
                          </Button.Icon>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </>
        )}
      </div>
    </>
  );
}

export default Proposals;
