import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profilePage";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/Loader";
import InputBox from "../components/InputBox";
import { uploadImage } from "../common/aws";
import { storeInSession } from "../common/session";
import toast from "react-hot-toast";

const EditProfile = () => {
  let {
    userAuth,
    userAuth: { accessToken },
    setUserAuth,
  } = useContext(UserContext);

  const bioLimit = 150;

  let profileImgEle = useRef();
  let editProfileForm = useRef();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);

  let {
    personalInfo: {
      fullname,
      username: profileUsername,
      profileImg,
      email,
      bio,
    },
    socialLinks,
  } = profile;

  useEffect(() => {
    if (accessToken) {
      axios
        .post(`${import.meta.env.VITE_SERVER_DOMAIN}/user/get-profile`, {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [accessToken]);

  const handleCharacterChange = (e) => {
    setCharactersLeft(bioLimit - e.target.value?.length);
  };

  const handleImagePreview = (e) => {
    let img = e.target.files[0];

    profileImgEle.current.src = URL.createObjectURL(img);

    setUpdatedProfileImg(img);
  };

  const handleImageUpload = (e) => {
    e.preventDefault();

    if (updatedProfileImg) {
      let loadingToast = toast.loading("Uploading Image...", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });

      e.target.setAttribute("disabled", true);

      uploadImage(updatedProfileImg)
        .then((url) => {
          if (url) {
            axios
              .post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/user/update-profile-img`,
                {
                  url,
                },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              )
              .then(({ data }) => {
                let newUserAuth = { ...userAuth, profileImg: data.profileImg };

                storeInSession("user", JSON.stringify(newUserAuth));

                setUserAuth(newUserAuth);

                setUpdatedProfileImg(null);

                toast.dismiss(loadingToast);

                e.target.removeAttribute("disabled");

                toast.success("Profile Picture Updated 👍", {
                  style: {
                    background: "#23272F",
                    color: "#fff",
                    textAlign: "center",
                  },
                });
              })
              .catch(({ response }) => {
                toast.dismiss(loadingToast);

                e.target.removeAttribute("disabled");

                toast.error(response.data.error, {
                  style: {
                    background: "#23272F",
                    color: "#fff",
                    textAlign: "center",
                  },
                });
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(editProfileForm.current);

    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let {
      fullname,
      username,
      bio,
      twitter,
      github,
      linkedin,
      website,
      instagram,
      youtube,
    } = formData;

    if (fullname?.length < 6) {
      return toast.error("Fullname should be atleast 6 characters long", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    if (username?.length < 3) {
      return toast.error("Username should be atleast 3 characters long", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    if (bio?.length > bioLimit) {
      return toast.error(`Bio should not be more than ${bioLimit} characters`, {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    let loadingToast = toast.loading("Updating Profile...", {
      style: {
        background: "#23272F",
        color: "#fff",
        textAlign: "center",
      },
    });

    e.target.setAttribute("disabled", true);

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/update-profile`,
        {
          fullname,
          username,
          bio,
          socialLinks: {
            twitter,
            github,
            linkedin,
            website,
            instagram,
            youtube,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(({ data }) => {
        if (
          userAuth.username != data.username ||
          userAuth.fullname != data.fullname
        ) {
          let newUserAuth = {
            ...userAuth,
            username: data.username,
            fullname: data.fullname,
          };

          storeInSession("user", JSON.stringify(newUserAuth));

          setUserAuth(newUserAuth);
        }

        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile Updated 👍", {
          style: {
            background: "#23272F",
            color: "#fff",
            textAlign: "center",
          },
        });
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error, {
          style: {
            background: "#23272F",
            color: "#fff",
            textAlign: "center",
          },
        });
      });
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm}>
          <h1 className="max-md:hidden">Edit Profile</h1>

          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="uploadImg"
                id="profileImgLabel"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                  Change Image
                </div>
                <img src={profileImg} ref={profileImgEle} />
              </label>

              <input
                type="file"
                id="uploadImg"
                accept=".jpg, .jpeg, .png"
                hidden
                onChange={handleImagePreview}
              />

              <button
                onClick={handleImageUpload}
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
              >
                Upload Image
              </button>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullname"
                    type="text"
                    value={fullname}
                    placeholder="Full Name"
                    icon="fi-rr-user"
                    className=" !capitalize"
                  />
                </div>

                <div>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email"
                    disable={true}
                    icon="fi-rr-envelope"
                  />
                </div>
              </div>

              <InputBox
                type="text"
                name="username"
                value={profileUsername}
                placeholder="username"
                icon="fi-rr-at"
              />

              <p className="text-dark-grey -mt-3">
                Username will be used to search users and will be visible to all
                users
              </p>

              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                placeholder="Add Bio"
                onChange={handleCharacterChange}
              ></textarea>

              <p className="mt-1 text-dark-grey text-sm text-right">
                {charactersLeft} characters left
              </p>

              <p className="my-6 text-dark-grey">Add your social handles</p>

              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(socialLinks)?.map((key, i) => {
                  let link = socialLinks[key];

                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={
                        "fi " +
                        (key != "website" ? "fi-brands-" + key : "fi-rr-globe")
                      }
                    />
                  );
                })}
              </div>

              <button
                onClick={handleSubmit}
                className="btn-dark w-full mx-auto px-10 mt-5"
                type="submit"
              >
                Update Profile
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
