import { useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './css/app.css';
import { Global } from "./Global";
import MyScrollbar from "../../src/index";
import { InputNumber } from "./InputNumber";
import { HexAlphaColorPicker } from "react-colorful";


function App() {
  const [count, setCount] = useState(0);
  const [autoHide, setAutoHide] = useState(true);
  const [trackSize, setTrackSize] = useState(14);
  const [trackInset, setTrackInset] = useState(2);
  const [trackColor, setTrackColor] = useState("#0000000d");
  const [thumbColor, setThumbColor] = useState("#aaaaaa");

  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div id="app-wrapper">
      <div id="docs">
        <div id="spacer" style={{ border: "none" }} />
        <div className="ticks"></div>
        <div id="spacer" />
        <section id="center">
          <div className="hero">
            <img src={heroImg} className="base" width="150" height="150" alt="" />
            <img src={reactLogo} className="framework" alt="React logo" />
            <img src={viteLogo} className="vite" alt="Vite logo" />
          </div>
          <div>
            <h1>{Global.title}</h1>
            <p>
              <b>Install:</b> <code>npm install {Global.packageName}</code>
            </p>
          </div>
          <div>Version: {Global.packageVersion}</div>

          <button
            type="button"
            className="counter"
            onClick={() => setCount((count) => count + 1)}
          >
            Count is {count}
          </button>
        </section>
        <div className="ticks" />
        <div id="spacer" />

      </div>

      {/* --------------------------------------------------------- */}

      <div id="social">
        <div id="spacer" style={{ border: "none" }} />
        <div className="ticks"></div>
        <div id="spacer" />

        <div style={{ padding: "0 1rem" }}>
          <h2 style={{ margin: "0 0 1rem 0" }}>Demo Scrollable Container</h2>

          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>

              <div>Auto hide scrollbar <input type="checkbox" checked={autoHide} onChange={(e) => setAutoHide(e.target.checked)} /> </div>

              <div style={{ marginTop: "0.25rem" }}>
                <span style={{ marginRight: "0.25rem" }}>Track size:</span>
                <InputNumber
                  id="track-size-input"
                  wrapperStyle={{ width: "100px" }}
                  value={trackSize}
                  min={0}
                  max={100}
                  step={1}
                  precision={0}
                  placeholder="Enter a number"
                  onChange={(val) => setTrackSize(val!)}
                />
              </div>

              <div style={{ marginTop: "0.25rem" }}>
                <span style={{ marginRight: "0.25rem" }}>Track inset:</span>
                <InputNumber
                  id="track-inset-input"
                  wrapperStyle={{ width: "100px" }}
                  value={trackInset}
                  min={0}
                  max={100}
                  step={1}
                  precision={0}
                  placeholder="Enter a number"
                  onChange={(val) => setTrackInset(val!)}
                />
              </div>

            </div>

            <div style={{ marginLeft: "0.5rem", display: "flex", flexDirection: "column" }}>

              <div >
                <span style={{ marginRight: "0.25rem" }}>Track color:</span>
                <HexAlphaColorPicker color={trackColor} onChange={setTrackColor} />
              </div>

            </div>

            <div style={{ marginLeft: "0.5rem", display: "flex", flexDirection: "column" }}>
              <div >
                <span style={{ marginRight: "0.25rem" }}>Thumb color:</span>
                <HexAlphaColorPicker color={thumbColor} onChange={setThumbColor} />
              </div>

            </div>
            <div></div>
          </div>

        </div>

        <section>
          <div
            className="scrollable-container"
            style={{
              position: "relative",   // ← required
              border: "1px solid #ccc",
            }}
          >
            <div
              className="scrollable-wrapper"
              ref={wrapperRef}
              style={{
                height: "100%",
                padding: "1rem",
                overflow: "auto",       // ← will be managed internally
                boxSizing: "border-box",
              }}
            >

              <div>
                <svg className="icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#documentation-icon"></use>
                </svg>
                <h2>Documentation</h2>
                <p>Your questions, answered</p>
                <ul>
                  <li>
                    <a href="https://vite.dev/" target="_blank">
                      <img className="logo" src={viteLogo} alt="" />
                      Explore Vite
                    </a>
                  </li>
                  <li>
                    <a href="https://react.dev/" target="_blank">
                      <img className="button-icon" src={reactLogo} alt="" />
                      Learn more
                    </a>
                  </li>
                </ul>
              </div>

              <div style={{ paddingTop: "2rem" }}>
                <svg className="icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#social-icon"></use>
                </svg>
                <h2>Connect with us</h2>
                <p>Join the Vite community</p>
                <ul>
                  <li>
                    <a href="https://github.com/vitejs/vite" target="_blank">
                      <svg
                        className="button-icon"
                        role="presentation"
                        aria-hidden="true"
                      >
                        <use href="/icons.svg#github-icon"></use>
                      </svg>
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="https://chat.vite.dev/" target="_blank">
                      <svg
                        className="button-icon"
                        role="presentation"
                        aria-hidden="true"
                      >
                        <use href="/icons.svg#discord-icon"></use>
                      </svg>
                      Discord
                    </a>
                  </li>
                  <li>
                    <a href="https://x.com/vite_js" target="_blank">
                      <svg
                        className="button-icon"
                        role="presentation"
                        aria-hidden="true"
                      >
                        <use href="/icons.svg#x-icon"></use>
                      </svg>
                      X.com
                    </a>
                  </li>
                  <li>
                    <a href="https://bsky.app/profile/vite.dev" target="_blank">
                      <svg
                        className="button-icon"
                        role="presentation"
                        aria-hidden="true"
                      >
                        <use href="/icons.svg#bluesky-icon"></use>
                      </svg>
                      Bluesky
                    </a>
                  </li>
                </ul>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tempor tristique finibus. Vestibulum eu rhoncus metus. Fusce a ultrices tortor. Maecenas imperdiet erat ut sodales sollicitudin. Nam eu tempor nulla, sit amet bibendum quam. Pellentesque et sapien a ante luctus lacinia. Duis vel mollis erat. Fusce ultrices felis id tincidunt congue.</p>
                <p>
                  Maecenas at ipsum molestie, feugiat turpis rutrum, aliquet metus. Aenean sit amet lorem in mi lobortis eleifend. Phasellus ornare cursus diam id lacinia. In hac habitasse platea dictumst. Proin risus mi, rhoncus et scelerisque in, malesuada at dolor. Donec eu viverra augue, in hendrerit turpis. Cras et velit facilisis, cursus risus id, dignissim turpis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras dolor felis, molestie eget arcu in, cursus porttitor lectus. Pellentesque enim libero, scelerisque id elit eu, bibendum interdum eros. Ut tincidunt magna in arcu ultricies, nec ornare ipsum hendrerit. Duis enim sem, posuere vitae maximus non, fermentum sed purus.
                </p>

                <p>
                  Etiam ultrices turpis non facilisis laoreet. Sed vitae dui et nulla aliquet lobortis. Curabitur vestibulum ante nec nulla iaculis lacinia. Morbi ac massa eros. Suspendisse lobortis feugiat nulla, id venenatis arcu efficitur non. Integer lacus magna, dictum ut libero a, condimentum dignissim enim. In hac habitasse platea dictumst. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer scelerisque lorem eros, feugiat faucibus dui feugiat a. Pellentesque et nulla sed nulla cursus luctus nec placerat justo. Nunc non dui risus. Phasellus vulputate bibendum facilisis.
                </p>

                <p>Morbi vestibulum risus at turpis viverra molestie a a risus. Donec commodo ultricies ligula. Proin elementum a arcu et lobortis. Nam convallis dapibus odio, pellentesque gravida velit cursus vel. Curabitur lacinia, erat quis sagittis porttitor, lorem ligula tempus justo, sed fringilla justo magna volutpat purus. Duis in tristique elit. Donec luctus elementum nisl eget accumsan.</p>

                <p>Donec auctor vitae ex id semper. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque maximus tristique ipsum, vitae sollicitudin enim blandit a. In tempor pharetra diam, eget rhoncus ante egestas vel. Maecenas sit amet finibus nibh, sed pulvinar augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nulla sit amet volutpat nisl, ut bibendum leo. Vestibulum ante justo, porta sed elit ut, luctus dictum ipsum.</p>
              </div>

            </div>

            {/* Scrollbar — must be LAST child so it renders on top */}
            <MyScrollbar
              parentRef={wrapperRef}
              vertical={true}
              horizontal={true}
              autoHide={autoHide}
              trackSize={trackSize}
              trackInset={trackInset}
              styles={{
                track: {
                  backgroundColor: trackColor,
                  padding: "5px"
                },
                thumb: {
                  backgroundColor: thumbColor,
                  borderRadius: "50px"
                },
                thumbHover: { backgroundColor: "#888" },
              }}
              animation={{
                fadeOutDelay: 3000,
                fadeInTransition: "opacity 0.3s ease",
                fadeOutTransition: "opacity 0.6s ease",
              }}
            />

          </div>
        </section>
        <div className="ticks" />
        <div id="spacer" />
      </div>
    </div>
  );
}

export default App;
