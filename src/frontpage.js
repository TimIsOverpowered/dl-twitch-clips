import React, { Component } from "react";
import "./css/frontpage.css";
import SimpleBar from "simplebar-react";
import client from "./client";
import Loader from "react-loader-spinner";
import moment from "moment";

class Frontpage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      end: moment().format("YYYY-MM-DD"),
      view_count: 1,
      clips_loading: true,
    };
  }

  componentDidMount() {
    document.title = "Clips by OP";

    if (!this.props.user) return;

    this.fetchClips();
  }

  fetchClips = async () => {
    const { accessToken } = await client.get("authentication");
    let clips;
    await fetch("https://clips.overpowered.tv:2053/v1/clips", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data);
        }
        clips = data;
      })
      .catch((e) => {
        console.error(e);
      });

    if (clips) {
      if (clips.length !== 0) {
        const pages = clips.reduce((resultArray, item, index) => {
          const chunkIndex = Math.floor(index / 100);

          if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [];
          }

          resultArray[chunkIndex].push(item);

          return resultArray;
        }, []);
        return this.setState({ clips: clips, pages: pages }, () => {
          this.displayClips();
        });
      }
    }

    this.setState({ clips: null }, () => {
      this.displayClips();
    });
  };

  displayClips = (page = 1) => {
    if (!this.state.clips) return this.setState({ clips_loading: false });
    const clips = this.state.pages.slice(0);
    this.setState({
      page: page,
      clipsHtml: clips[page - 1].map((clip, i) => (
        <div key={i} className="clips-mg-b-2">
          <article className="clips-flex clips-flex-column clips-mg-0">
            <div className="clips-item-order-2 clips-mg-t-1">
              <div className="clips-flex clips-flex-nowrap">
                <div className="clips-flex-grow-1 clips-flex-shrink-1 clips-full-width clips-item-order-2 clips-media-card-meta__text-container">
                  <div className="clips-media-card-meta__title">
                    <div className="clips-c-text-alt">
                      <a
                        className="clips-full-width clips-interactive clips-link clips-link--hover-underline-none clips-link--inherit"
                        href={`${clip.url}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <div className="clips-align-items-start clips-flex">
                          <h3
                            className="clips-ellipsis clips-font-size-5"
                            title={clip.title}
                          >
                            {clip.title}
                          </h3>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="clips-media-card-meta__links"></div>
                </div>
              </div>
            </div>
            <div className="clips-item-order-1">
              <div className="clips-relative">
                <div className="clips-relative">
                  <div className="clips-c-text-overlay">
                    <a
                      className="clips-full-width clips-interactive clips-link clips-link--hover-underline-none clips-link--inherit"
                      href={`${clip.downloadLink}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <div className="clips-relative">
                        <div className="ScAspectRatio-sc-1sw3lwy-1 dNNaBC">
                          <div className="ScAspectSpacer-sc-1sw3lwy-0 hhnnBG"></div>
                          <div className="clips-c-background-alt-2 clips-overflow-hidden">
                            <div className="ScAspectRatio-sc-1sw3lwy-1 dNNaBC">
                              <div className="ScAspectSpacer-sc-1sw3lwy-0 hhnnBG"></div>
                              <div className="preview-card-thumbnail__image">
                                <img
                                  alt={clip.title}
                                  title={clip.title}
                                  className="clips-image"
                                  src={clip.thumbnail_url}
                                ></img>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="clips-absolute clips-full-height clips-full-width clips-left-0 clips-top-0">
                          <div className="clips-absolute clips-bottom-0 clips-left-0 clips-mg-1">
                            <div className="clips-align-items-center clips-border-radius-small clips-c-background-overlay clips-c-text-overlay clips-flex clips-font-size-6 clips-justify-content-center clips-media-card-stat">
                              <p style={{ fontWeight: "700" }}>
                                {clip.view_count}
                              </p>
                            </div>
                          </div>
                          <div className="clips-absolute clips-bottom-0 clips-mg-1 clips-right-0">
                            <div className="clips-align-items-center clips-border-radius-small clips-c-background-overlay clips-c-text-overlay clips-flex clips-font-size-6 clips-justify-content-center clips-media-card-stat">
                              <p style={{ fontWeight: "700" }}>
                                {moment(clip.created_at).format("MM-DD-YYYY")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      )),
      clips_loading: false,
    });
  };

  handleConnect = () => {
    window.location.href = `https://clips.overpowered.tv:2053/oauth/twitch`;
  };

  handleStartInput = (evt) => {
    this.setState({ start: evt.target.value });
  };

  handleEndInput = (evt) => {
    this.setState({ end: evt.target.value });
  };

  handleViewCountInput = (evt) => {
    const view_count = evt.target.value;
    if (view_count < 1 || view_count > 999999999999) {
      evt.target.value = 1;
      evt.target.select();
    }
    this.setState({ view_count: evt.target.value });
  };

  handleViewCountFocus = (evt) => {
    if (!evt) return;
    evt.target.select();
  };

  nextPage = (evt) => {
    if (!evt) return;
    this.displayClips(this.state.page.valueOf() + 1);
  };

  previousPage = (evt) => {
    if (!evt) return;
    this.displayClips(this.state.page.valueOf() - 1);
  };

  downloadClips = async (evt) => {
    if (!evt) return;
    this.setState({ downloading: true });

    let manualDownloads = [];
    for (let clip of this.state.clips) {
      if (!clip.downloadLink.includes("AT")) {
        manualDownloads.push(clip.downloadLink);
        continue;
      }
      window.location.href = clip.downloadLink;
      await this.sleep(300);
    }

    if (manualDownloads.length !== 0) {
      prompt(
        "THESE FOLLOWING CLIPS NEED TO BE MANUALLY DOWNLOADED,\n\nYOU CAN COPY THE LINKS BY PRESSING CTRL+C AND PASTING IN A NOTEPAD",
        manualDownloads.join("\n")
      );
    }

    this.setState({ downloading: false });
  };

  sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  getClips = async (evt) => {
    if (!evt) return;
    const startMoment = moment(this.state.start, "YYYY-MM-DD", true);
    const endMoment = moment(this.state.end, "YYYY-MM-DD", true);
    if (!startMoment.isValid() || !endMoment.isValid())
      return alert("Invalid Date");
    if (startMoment.isSameOrAfter(endMoment))
      return alert("Start date is past After date");
    if (endMoment.isAfter(moment()) || startMoment.isAfter(moment()))
      return alert("Date(s) is after today's date.");
    if (
      startMoment.isBefore(moment().day(26).month(5).year(2016)) ||
      endMoment.isBefore(moment().day(26).month(5).year(2016))
    )
      return alert("Date(s) before launch of clips");

    this.setState({ clips_loading: true });

    const { accessToken } = await client.get("authentication");

    let clips;
    await fetch("https://clips.overpowered.tv:2053/v1/clips", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: startMoment.toISOString(),
        end: endMoment.toISOString(),
        view_count: this.state.view_count,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data);
        }
        clips = data;
      })
      .catch((e) => {
        console.error(e);
      });
    if (clips) {
      if (clips.length !== 0) {
        const pages = clips.reduce((resultArray, item, index) => {
          const chunkIndex = Math.floor(index / 100);

          if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [];
          }

          resultArray[chunkIndex].push(item);

          return resultArray;
        }, []);
        return this.setState({ clips: clips, pages: pages }, () => {
          this.displayClips();
        });
      }
    }

    this.setState({ clips: null }, () => {
      this.displayClips();
    });
  };

  render() {
    if (!this.props.user) {
      return (
        <div className="clips-flex clips-flex-nowrap clips-full-height clips-overflow-hidden clips-relative">
          <main
            style={{ justifyContent: "center", alignItems: "center" }}
            className="clips-flex clips-flex-column clips-flex-grow-1 clips-full-height clips-full-width clips-overflow-hidden clips-relative clips-z-default"
          >
            <div style={{ marginTop: "40vh" }}>
              <a
                className="clips-link"
                href="https://twitter.com/overpowered"
                target="_blank"
                rel="noreferrer noopener"
              >
                <h2>Download your clips by Overpowered</h2>
              </a>
            </div>
            <div className="clips-flex clips-full-height clips-mg-r-1 clips-pd-y-1">
              <div className="clips-flex clips-flex-nowrap">
                <div className="clips-pd-x-05">
                  <button
                    onClick={this.handleConnect}
                    className="clips-align-items-center clips-align-middle clips-border-bottom-left-radius-medium clips-border-bottom-right-radius-medium clips-border-top-left-radius-medium clips-border-top-right-radius-medium clips-core-button clips-core-button--primary clips-inline-flex clips-interactive clips-justify-content-center clips-overflow-hidden clips-relative"
                    style={{ backgroundColor: "rgb(145, 70, 255)" }}
                  >
                    <div className="clips-align-items-center clips-core-button-label clips-flex clips-flex-grow-0">
                      <figure
                        className="clips-svg"
                        style={{ marginRight: "0.5rem" }}
                      >
                        <svg
                          className="clips-svg__asset"
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="40"
                          viewBox="0 0 17 20"
                          fill="none"
                        >
                          <path
                            d="M3.54167 0L0 3.57143V16.4286H4.25V20L7.79167 16.4286H10.625L17 10V0H3.54167ZM15.5833 9.28571L12.75 12.1429H9.91667L7.4375 14.6429V12.1429H4.25V1.42857H15.5833V9.28571Z"
                            fill="white"
                          ></path>
                          <path
                            d="M13.4584 3.92847H12.0417V8.21418H13.4584V3.92847Z"
                            fill="white"
                          ></path>
                          <path
                            d="M9.56242 3.92847H8.14575V8.21418H9.56242V3.92847Z"
                            fill="white"
                          ></path>
                        </svg>
                      </figure>
                      <div className="clips-flex-grow-0">Connect</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="clips-flex clips-flex-nowrap clips-full-height clips-overflow-hidden clips-relative">
        <main className="clips-flex clips-flex-column clips-flex-grow-1 clips-full-height clips-full-width clips-overflow-hidden clips-relative clips-z-default">
          <div className="clips-border-b clips-border-l clips-border-r clips-border-t clips-flex clips-flex-row clips-full-width clips-justify-content-center video-timeline-top-toolbar__background">
            <div className="clips-flex clips-flex-row clips-justify-content-between">
              <div className="clips-full-width clips-inline-flex clips-align-items-center clips-relative clips-tooltip-wrapper">
                <div className="offset-selector__input-button clips-align-items-center clips-flex clips-full-height clips-justify-content-start clips-pd-l-1 clips-pd-r-05">
                  <div className="clips-full-width offset-selector__input-label">
                    <p className="clips-c-text-alt-2">Clips starting from:</p>
                  </div>

                  <div className="offset-selector__offset-input clips-inline-flex">
                    <input
                      type="date"
                      className="clips-align-right clips-border-bottom-left-radius-medium clips-border-bottom-right-radius-medium clips-border-top-left-radius-medium clips-border-top-right-radius-medium clips-font-size-6 clips-full-width clips-input clips-pd-l-1 clips-pd-r-1 clips-pd-y-05"
                      autoCapitalize="off"
                      autoCorrect="off"
                      autoComplete="off"
                      required={true}
                      onChange={this.handleStartInput}
                    />
                  </div>
                </div>

                <div className="offset-selector__input-button clips-align-items-center clips-flex clips-full-height clips-justify-content-start clips-pd-l-1 clips-pd-r-05">
                  <div className="clips-full-width offset-selector__input-label">
                    <p className="clips-c-text-alt-2">Until:</p>
                  </div>

                  <div className="offset-selector__offset-input clips-inline-flex">
                    <input
                      type="date"
                      className="clips-align-right clips-border-bottom-left-radius-medium clips-border-bottom-right-radius-medium clips-border-top-left-radius-medium clips-border-top-right-radius-medium clips-font-size-6 clips-full-width clips-input clips-pd-l-1 clips-pd-r-1 clips-pd-y-05"
                      autoCapitalize="off"
                      autoCorrect="off"
                      autoComplete="off"
                      required={true}
                      defaultValue={this.state.end}
                      onChange={this.handleEndInput}
                    />
                  </div>
                </div>

                <div className="offset-selector__input-button clips-align-items-center clips-flex clips-full-height clips-justify-content-start clips-pd-l-1 clips-pd-r-05">
                  <div className="offset-selector__input-label">
                    <p className="clips-c-text-alt-2">View Count Threshold:</p>
                  </div>

                  <div style={{ width: "8rem" }} className="clips-inline-flex">
                    <input
                      type="number"
                      style={{ textAlign: "center" }}
                      className="clips-align-right clips-border-bottom-left-radius-medium clips-border-bottom-right-radius-medium clips-border-top-left-radius-medium clips-border-top-right-radius-medium clips-font-size-6 clips-full-width clips-input clips-pd-l-1 clips-pd-r-1 clips-pd-y-05"
                      autoCapitalize="off"
                      autoCorrect="off"
                      autoComplete="off"
                      required={true}
                      defaultValue={this.state.view_count}
                      onFocus={this.handleViewCountFocus}
                      onChange={this.handleViewCountInput}
                    />
                  </div>
                </div>

                <div className="clips-inline-flex clips-relative clips-tooltip-wrapper">
                  <div className="offset-selector__button clips-align-items-center clips-flex clips-justify-content-center">
                    <button
                      onClick={this.getClips}
                      disabled={this.state.clips_loading ? true : ""}
                      className={
                        this.state.clips_loading
                          ? "clips-mg-r-1 clips-align-items-center clips-align-middle clips-border-bottom-left-radius-medium clips-border-bottom-right-radius-medium clips-border-top-left-radius-medium clips-border-top-right-radius-medium clips-core-button clips-core-button--disabled clips-inline-flex clips-interactive clips-justify-content-center clips-overflow-hidden clips-relative"
                          : "clips-mg-r-1 clips-align-items-center clips-align-middle clips-border-bottom-left-radius-medium clips-border-bottom-right-radius-medium clips-border-top-left-radius-medium clips-border-top-right-radius-medium clips-core-button clips-core-button--primary clips-inline-flex clips-interactive clips-justify-content-center clips-overflow-hidden clips-relative"
                      }
                    >
                      <div className="clips-align-items-center clips-core-button-label clips-flex clips-flex-grow-0">
                        <div className="clips-flex-grow-0">Get Clips</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {this.state.clips_loading ? (
            <div style={{ padding: "30vh 0", textAlign: "center" }}>
              <Loader type="Oval" color="#00BFFF" height={150} width={150} />
              <h2
                style={{ color: "#fff", marginTop: "2rem", fontSize: "2rem" }}
              >
                Loading...
              </h2>
            </div>
          ) : this.state.clips ? (
            <SimpleBar className="root-scrollable scrollable-area">
              <div
                style={{ textAlign: "center" }}
                className="clips-full-width clips-mg-t-2"
              >
                <h2>{`There are ${this.state.clips.length} clips`}</h2>
              </div>
              <div
                className="clips-flex"
                style={{ alignItems: "center", justifyContent: "center" }}
              >
                <p>{`Page ${this.state.page}/${this.state.pages.length}`}</p>
                <button
                  style={{ marginLeft: "2rem" }}
                  onClick={this.downloadClips}
                  disabled={this.state.downloading ? true : ""}
                  className={
                    this.state.downloading
                      ? "clips-mg-r-1 clips-align-items-center clips-align-middle clips-border-bottom-left-radius-medium clips-border-bottom-right-radius-medium clips-border-top-left-radius-medium clips-border-top-right-radius-medium clips-core-button clips-core-button--disabled clips-inline-flex clips-interactive clips-justify-content-center clips-overflow-hidden clips-relative"
                      : "clips-mg-r-1 clips-align-items-center clips-align-middle clips-border-bottom-left-radius-medium clips-border-bottom-right-radius-medium clips-border-top-left-radius-medium clips-border-top-right-radius-medium clips-core-button clips-core-button--primary clips-inline-flex clips-interactive clips-justify-content-center clips-overflow-hidden clips-relative"
                  }
                >
                  <div className="clips-align-items-center clips-core-button-label clips-flex clips-flex-grow-0">
                    <div className="clips-flex-grow-0">Download all Clips</div>
                  </div>
                </button>
                {this.state.page === 1 && this.state.pages.length !== 1 ? (
                  <button
                    onClick={this.nextPage}
                    className="clips-mg-l-1 clips-block clips-interactable clips-interactable--default clips-interactable--hover-enabled clips-interactive"
                  >
                    <div className="offset-selector__icon clips-align-items-center clips-flex clips-justify-content-center">
                      <figure className="clips-svg right-arrow">
                        <svg
                          className="clips-svg__asset"
                          width="24"
                          height="24"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        >
                          <path d="M12 0c-6.623 0-12 5.377-12 12s5.377 12 12 12 12-5.377 12-12-5.377-12-12-12zm0 1c-6.071 0-11 4.929-11 11s4.929 11 11 11 11-4.929 11-11-4.929-11-11-11zm4.828 11.5l-4.608 3.763.679.737 6.101-5-6.112-5-.666.753 4.604 3.747h-11.826v1h11.828z" />
                        </svg>
                      </figure>
                    </div>
                  </button>
                ) : this.state.page === this.state.pages.length &&
                  this.state.pages.length !== 1 ? (
                  <button
                    onClick={this.previousPage}
                    className="clips-mg-l-1 clips-block clips-interactable clips-interactable--default clips-interactable--hover-enabled clips-interactive"
                  >
                    <div className="offset-selector__icon clips-align-items-center clips-flex clips-justify-content-center">
                      <figure className="clips-svg left-arrow">
                        <svg
                          className="clips-svg__asset"
                          width="24"
                          height="24"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        >
                          <path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11zm-4.828 11.5l4.608 3.763-.679.737-6.101-5 6.112-5 .666.753-4.604 3.747h11.826v1h-11.828z" />
                        </svg>
                      </figure>
                    </div>
                  </button>
                ) : this.state.pages.length === 1 ? (
                  <></>
                ) : (
                  <>
                    <button
                      onClick={this.previousPage}
                      className="clips-mg-l-1 clips-block clips-interactable clips-interactable--default clips-interactable--hover-enabled clips-interactive"
                    >
                      <div className="offset-selector__icon clips-align-items-center clips-flex clips-justify-content-center">
                        <figure className="clips-svg left-arrow">
                          <svg
                            className="clips-svg__asset"
                            width="24"
                            height="24"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          >
                            <path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11zm-4.828 11.5l4.608 3.763-.679.737-6.101-5 6.112-5 .666.753-4.604 3.747h11.826v1h-11.828z" />
                          </svg>
                        </figure>
                      </div>
                    </button>

                    <button
                      onClick={this.nextPage}
                      className="clips-mg-l-1 clips-block clips-interactable clips-interactable--default clips-interactable--hover-enabled clips-interactive"
                    >
                      <figure className="clips-svg right-arrow">
                        <svg
                          className="clips-svg__asset"
                          width="24"
                          height="24"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        >
                          <path d="M12 0c-6.623 0-12 5.377-12 12s5.377 12 12 12 12-5.377 12-12-5.377-12-12-12zm0 1c-6.071 0-11 4.929-11 11s4.929 11 11 11 11-4.929 11-11-4.929-11-11-11zm4.828 11.5l-4.608 3.763.679.737 6.101-5-6.112-5-.666.753 4.604 3.747h-11.826v1h11.828z" />
                        </svg>
                      </figure>
                    </button>
                  </>
                )}
              </div>
              <div className="root-scrollable__wrapper clips-full-width clips-relative">
                <div className="clips-mg-x-3">
                  <div className="common-centered-column">
                    <div className="clips-pd-b-3 clips-pd-t-2">
                      <div
                        className="clips-flex-shrink-0"
                        style={{ position: "relative" }}
                      >
                        <div className="clips-flex-wrap clips-tower clips-tower--300 clips-tower--gutter-xs">
                          {this.state.clipsHtml}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SimpleBar>
          ) : this.state.clips === null ? (
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  lineHeight: "80vh",
                  fontSize: "4rem",
                  color: "#fff",
                }}
              >
                There are no clips :(
              </h2>
            </div>
          ) : (
            <></>
          )}
        </main>
      </div>
    );
  }
}

export default Frontpage;
