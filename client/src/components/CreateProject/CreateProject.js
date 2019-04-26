import React, { Component } from 'react';
import ReactCloudinaryUploader from '@app-masters/react-cloudinary-uploader';
import CreatableSelect from 'react-select/lib/Creatable';
import { Mutation } from 'react-apollo';
import { Redirect } from 'react-router';
import { CREATE_PROJECT } from '../../query/query';
import './CreateProject.scss';

import Header from '../Home/Header/Header';

class CreateProject extends Component {
  constructor(props) {
    super(props);

    const user = localStorage.getItem('authUser');
    const json = JSON.parse(user);
    const userPull = this.props.users.filter(
      (user) => user.email === json.email
    );
    const { username, email } = userPull[0];

    const categories = this.props.projects.map((project) => project.category);
    let filteredCategories = [...new Set(categories)];

    this.state = {
      imgDeleteDisabled: true,
      categories: filteredCategories,
      username: username,
      email: email,
      submitDisabled: true,
      project: {
        name: '',
        category: '',
        timestamp: '',
        titleImg: '',
        titleBlurb: '',
        steps: [{ type: '', body: '' }]
      }
    };
  }

  componentWillUnmount = () => {
    console.log({ unMountState: this.state }, 'unmounting');
  };

  // componentWillMount = () => {
  //   console.log({newMountState: this.state})
  // }
  componentDidMount = () => {
    console.log({ newMountState: this.state });

    if (typeof this.state.project.steps === 'string') {
      let steps = this.state.project.steps;
      let array = JSON.parse(steps);
      this.setState({
        ...this.state,
        project: { ...this.state.project, steps: array }
      });
    }
  };

  textChange = async (e) => {
    let value = e.target.value;
    let x = document.activeElement.tagName;
    await this.setState({
      project: {
        ...this.state.project,
        [e.target.name]: value
      }
    });

    console.log({ name: this.state.project.name, focus: x });
  };
  textChangeHandler = (index) => (e) => {
    const newText = this.state.project.steps.map((step, sidx) => {
      if (index !== sidx) return step;
      return { type: 'text', body: e.target.value };
    });

    const final = newText.concat([{ type: '', body: '' }]);

    this.setState({
      project: {
        ...this.state.project,
        steps: newText
      }
    });
    console.log({ steps: this.state.project.steps });
  };

  handleAddStep = () => {
    this.setState({
      ...this.state,
      project: {
        ...this.state.project,
        steps: this.state.project.steps.concat([{ type: '', body: '' }])
      }
    });
    console.log({ steps: this.state.project.steps });
  };

  addImage = (img) => {
    const steps = this.state.project.steps.filter(
      (step) => step !== { type: '', body: '' }
    );

    const newSteps = steps.concat({ type: 'img', body: img });

    const extraStep = newSteps.concat({ type: '', body: '' });

    this.setState({
      project: {
        ...this.state.project,
        steps: extraStep
      }
    });
  };

  deletePhoto = (idx) => () => {
    const steps = this.state.project.steps.filter(
      (step) => step !== { type: '', body: '' }
    );
    const filtered = steps.filter((step, sidx) => idx !== sidx);
    this.setState({
      project: {
        steps: [filtered, { type: '', body: '' }]
      }
    });
    console.log({ steps: this.state.project.steps });
  };

  removeTextStep = (idx) => () => {
    const steps = this.state.project.steps.filter((step, sidx) => idx !== sidx);
    this.setState({
      project: { steps: steps }
    });
    console.log({ steps: this.state.project.steps });
  };

  openCloudinary = (e) => {
    e.preventDefault();
    let options = {
      cloud_name: 'dv1rhurfd',
      upload_preset: 'korisbak',
      returnJustUrl: true,
      maxImageWidth: 400,
      maxImageHeight: 500
    };
    ReactCloudinaryUploader.open(options)
      .then((image) => {
        console.log({ image: image });
        if (this.props.returnJustUrl) image = image.url;
        this.addImage(image);
      })
      .catch((err) => {
        console.error({ error: err });
      });
  };

  mainImage = (e) => {
    e.preventDefault();
    let options = {
      cloud_name: 'dv1rhurfd',
      upload_preset: 'korisbak',
      returnJustUrl: true,
      maxImageWidth: 400,
      maxImageHeight: 500
    };
    ReactCloudinaryUploader.open(options)
      .then((image) => {
        console.log({ image: image });
        if (this.props.returnJustUrl) image = image.url;
        this.setState({
          imgDeleteDisabled: false,
          project: {
            ...this.state.project,
            titleImg: image
          }
        });
      })
      .catch((err) => {
        console.error({ error: err });
      });
  };

  deleteMainImg = () => {
    this.setState({
      ...this.state,
      imgDeleteDisabled: true,
      project: {
        ...this.state.project,
        titleImg: ''
      }
    });
  };

  handleChange = async (newValue, actionMeta) => {
    console.group('Value Changed');
    console.log(newValue);
    console.log(`action: ${actionMeta.action}`);
    console.groupEnd();

    let value = '';

    if (newValue !== null) value = await newValue.value;

    await this.setState({
      ...this.state,
      project: {
        ...this.state.project,
        category: value
      }
    });
    await console.log({ category: this.state.project.category });
  };

  finalize = async (e) => {
    e.preventDefault();
    let steps = this.state.project.steps.map((step) => {
      return step.body;
    });
    try {
      const steps = await this.state.project['steps'];

      const filter = await steps.filter(
        (step) => step.type !== '' && step.body !== ''
      );

      const string = await JSON.stringify(filter);

      const date = await new Date(Date.now());

      const { name, category, titleImg, titleBlurb } = await this.state.project;

      await console.log({
        b4name: name,
        b4cat: category,
        b4titleImg: titleImg,
        b4titleBlurb: titleBlurb
      });

      await this.setState({
        ...this.state,
        submitDisabled: false,
        project: {
          name: name,
          category: category,
          titleImg: titleImg,
          titleBlurb: titleBlurb,
          steps: string,
          timestamp: date
        }
      });

      await console.log({ finalizeState: this.state });
    } catch (err) {
      console.log({ error: err });
    }
  };

  render() {
    const projCheck = () => {
      const proj = this.state.project;
      for (let key in proj) {
        if (proj[key] !== null && proj[key] != '') return false;
      }
      return true;
    };

    const userCheck = () => {
      if (this.state.username !== null && this.state.username != '') {
        return false;
      } else {
        return true;
      }
    };

    // const isEnabled = projCheck() && userCheck();

    const cats = this.state.categories.map((cat) => {
      return { value: cat, label: cat };
    });

    // const steps = JSON.parse(this.state.project.steps)

    if (
      this.state.project.steps != null &&
      typeof this.state.project.steps === 'object'
    ) {
      let type = typeof this.state.project.steps;
      console.log({ steps: this.state.project.steps, stepArray: type });
      return (
        <div className="projectInfo">
          <form>
            <h1>Create Project</h1>
            <div className="projectTitle">
              <h2>Title</h2>

              <input
                type="text"
                name="name"
                className="projectTitleInput"
                value={this.state.project.name}
                onChange={this.textChange}
                placeholder="Add Title"
              />
            </div>
            <div className="titleImage">
              <div className="setThumbnail">
                <h3>Set Category</h3>
                <CreatableSelect
                  isClearable
                  onChange={this.handleChange}
                  className="category"
                  onInputChange={this.handleInputChange}
                  options={cats}
                  value={{
                    value: this.state.project.category,
                    label: this.state.project.category
                  }}
                />
              </div>
              <div className="imageArea">
                {/* <button disabled={this.state.imgDeleteDisabled} onClick={this.deleteMainImg}>Delete Photo</button> */}
                <div className="descriptionRow">
                  <h2>Project Description:</h2>
                  <div className="image-description">
                    {this.state.project.titleImg ? (
                      <img src={this.state.project.titleImg} alt="mainImage" />
                    ) : (
                      <div className="emptyMainImage">
                        <button onClick={this.mainImage}>Set Main Image</button>
                      </div>
                    )}

                    <textarea
                      rows="6"
                      placeHolder="Add Description..."
                      cols="75"
                      name="titleBlurb"
                      value={this.state.project.titleBlurb}
                      onChange={this.textChange}
                    />
                  </div>
                </div>
              </div>
              <div className="conditionalImage">
                {this.state.project.titleImg ? (
                  <button
                    className="conditionalButton"
                    onClick={this.mainImage}
                  >
                    CHANGE MAIN IMAGE
                  </button>
                ) : null}
              </div>
            </div>

            <div className="stepSection">
              <h2>Steps:</h2>
              <div>
                {this.state.project['steps'].map((step, idx) => {
                  if (step.type === 'img') {
                    return (
                      <div key={idx}>
                        <img src={step.body} />
                        <button onClick={this.deletePhoto(idx)}>
                          Delete Photo
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div key={idx}>
                        <textArea
                          type="text"
                          placeholder="Add Step..."
                          value={step.body}
                          onChange={this.textChangeHandler(idx)}
                        />

                        <button
                          type="button"
                          onClick={this.handleAddStep}
                          className="addStep"
                        >
                          Add Step
                        </button>
                        <button
                          className="addPicture"
                          onClick={this.openCloudinary}
                        >
                          Add Picture
                        </button>
                        <button
                          type="button"
                          onClick={this.removeTextStep(idx)}
                          className="removeStep"
                        >
                          Remove This Step
                        </button>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
            {this.state.submitDisabled ? (
              <button
                className="submitButton"
                type="button"
                onClick={this.finalize}
              >
                Finalize
              </button>
            ) : (
              <button
                className="submitButton"
                type="submit"
                disabled={this.state.submitDisabled}
              >
                Submit
              </button>
            )}
          </form>
        </div>
      );
    } else {
      let type = typeof this.state.project.steps;
      console.log({ steps: this.state.project.steps, stepArray: type });
      let steps = JSON.parse(this.state.project.steps);

      return (
        <Mutation mutation={CREATE_PROJECT}>
          {(newProject, { loading, error, data }) => {
            if (loading) return <span>Submitting your project...</span>;
            if (error) return <span>{`Error: ${error}`}</span>;
            if (data)
              return <Redirect to={`/${this.state.username}/projects`} />;
            return (
              <div className="projectInfo">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    newProject({
                      variables: {
                        name: this.state.project.name,
                        category: this.state.project.category,
                        timestamp: this.state.project.timestamp,
                        titleImg: this.state.project.titleImg,
                        titleBlurb: this.state.project.titleBlurb,
                        steps: this.state.project.steps,
                        username: this.state.username
                      }
                    });
                    console.log({ data: this.props.data });
                  }}
                >
                  {' '}
                  <div className="projectInfo">
                    <form>
                      <h1>Create Project</h1>
                      <div className="projectTitle">
                        <h2>Title</h2>

                        <input
                          type="text"
                          name="name"
                          className="projectTitleInput"
                          value={this.state.project.name}
                          onChange={this.textChange}
                          placeholder="Add Title"
                        />
                      </div>
                      <div className="titleImage">
                        <div className="setThumbnail">
                          <h3>Set Category</h3>
                          <CreatableSelect
                            isClearable
                            onChange={this.handleChange}
                            className="category"
                            onInputChange={this.handleInputChange}
                            options={cats}
                            value={{
                              value: this.state.project.category,
                              label: this.state.project.category
                            }}
                          />
                        </div>
                        <div className="imageArea">
                          {/* <button disabled={this.state.imgDeleteDisabled} onClick={this.deleteMainImg}>Delete Photo</button> */}
                          <div className="descriptionRow">
                            <h2>Project Description:</h2>
                            <div className="image-description">
                              {this.state.project.titleImg ? (
                                <img
                                  src={this.state.project.titleImg}
                                  alt="mainImage"
                                />
                              ) : (
                                <div className="emptyMainImage">
                                  <button onClick={this.mainImage}>
                                    Set Main Image
                                  </button>
                                </div>
                              )}

                              <textarea
                                rows="6"
                                placeHolder="Add Description..."
                                cols="75"
                                name="titleBlurb"
                                value={this.state.project.titleBlurb}
                                onChange={this.textChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="conditionalImage">
                          {this.state.project.titleImg ? (
                            <button
                              className="conditionalButton"
                              onClick={this.mainImage}
                            >
                              CHANGE MAIN IMAGE
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="stepSection">
                        <h2>Steps:</h2>
                        <div>
                          {steps.map((step, idx) => {
                            if (step.type === 'img') {
                              return (
                                <div key={idx}>
                                  <img src={step.body} />
                                  <button onClick={this.deletePhoto(idx)}>
                                    Delete Photo
                                  </button>
                                </div>
                              );
                            } else {
                              return (
                                <div key={idx}>
                                  <textArea
                                    type="text"
                                    placeholder="Add Step..."
                                    value={step.body}
                                    onChange={this.textChangeHandler(idx)}
                                  />

                                  <button
                                    type="button"
                                    onClick={this.handleAddStep}
                                    className="addStep"
                                  >
                                    Add Step
                                  </button>
                                  <button
                                    className="addPicture"
                                    onClick={this.openCloudinary}
                                  >
                                    Add Picture
                                  </button>
                                  <button
                                    type="button"
                                    onClick={this.removeTextStep(idx)}
                                    className="removeStep"
                                  >
                                    Remove This Step
                                  </button>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                      {this.state.submitDisabled ? (
                        <button
                          className="submitButton"
                          type="button"
                          onClick={this.finalize}
                        >
                          Finalize
                        </button>
                      ) : (
                        <button
                          className="submitButton"
                          type="submit"
                          disabled={this.state.submitDisabled}
                        >
                          Submit
                        </button>
                      )}
                    </form>
                  </div>
                  {this.state.submitDisabled ? (
                    <button type="button" onClick={this.finalize}>
                      Finalize
                    </button>
                  ) : (
                    <button type="submit" disabled={this.state.submitDisabled}>
                      Submit
                    </button>
                  )}
                </form>
              </div>
            );
          }}
        </Mutation>
      );
    }
  }
}

export default CreateProject;
