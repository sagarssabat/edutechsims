import { Component, h, State, Watch, Prop } from '@stencil/core';
import { TimelineMax } from 'gsap';

@Component({
  tag: 'density-sim1',
  styleUrl: 'density-sim.scss',
  shadow: false,
})
export class MyComponent {
  private ballRef?: SVGElement;
  private smallBeaker?: SVGElement;
  private timeLineInstance: TimelineMax;

  @Prop() densityOfLiquidOptions: string = "[]";
  @Prop() densityOfSolidOptions: string = "[]";
  @Prop() defaultSelectedLiquid: string = "";
  @Prop() defaultSelectedSolid: string = "";
  @Prop() customLiquidColor: string = "Blue";
  @Prop() customSolidColor: string = "Red";

  @State() densityOfLiquid: string = "1.0";
  @State() densityOfSolid: string = "0.7";
  @State() volumeOfSphere: string = "40";
  @State() ans: string = "0";

  @State() customLiquid: string = "1.0"
  @State() customSolid: string = "0.7"

  calculateVolumeOfSphere(ds: number, vs: number, dl: number) {
    return (ds * vs) / dl;
  }

  @Watch('densityOfLiquid')
  onDensityOfLiquidChange(newVal) {
    if (newVal != "-1") this.customLiquid = newVal
  }

  @Watch('densityOfSolid')
  onDensityOfSolidChange(newVal) {
    if (newVal != "-1") this.customSolid = newVal
  }

  @Watch('densityOfLiquid')
  @Watch('densityOfSolid')
  @Watch('volumeOfSphere')
  @Watch('customLiquid')
  @Watch('customSolid')
  onSubmit() {
    let densityOfLiquid = parseFloat(this.densityOfLiquid === "-1" ? this.customLiquid : this.densityOfLiquid);
    let densityOfSolid = parseFloat(this.densityOfSolid === "-1" ? this.customSolid : this.densityOfSolid);
    let volumeOfSphere = parseFloat(this.volumeOfSphere);

    let ans = this.calculateVolumeOfSphere(densityOfSolid, volumeOfSphere, densityOfLiquid);

    this.ballRef.setAttribute("r", String(volumeOfSphere));
    let dropHeight = 157;
    if (ans >= volumeOfSphere) {
      dropHeight = 472 - (volumeOfSphere - 100)
    } else {
      dropHeight = ((157 - (volumeOfSphere - 100)) + (ans * 2))
    }

    const t1 = new TimelineMax();
    t1.to(this.ballRef, { y: dropHeight, duration: 2, ease: "sine.in" });
    t1.to(this.smallBeaker, { duration: 2, y: -(ans > volumeOfSphere ? 100 : ans), ease: "slow.in" }, 1.5);
    this.timeLineInstance = t1
    this.ans = ans.toFixed(2)
  }

  reset() {
    this.densityOfLiquid = this.defaultSelectedLiquid
    this.densityOfSolid = this.defaultSelectedSolid
    this.timeLineInstance?.restart()
  }
  render() {
    const densityOfLiquidOptions = JSON.parse(this.densityOfLiquidOptions)
    const densityOfSolidOptions = JSON.parse(this.densityOfSolidOptions)

    const liquidColor = this.densityOfLiquid === "-1" ? this.customLiquidColor : densityOfLiquidOptions.find(l => l.value == this.densityOfLiquid).color
    const solidColor = this.densityOfSolid === "-1" ? this.customSolidColor : densityOfSolidOptions.find(l => l.value == this.densityOfSolid).color

    return <div class="sims-component mx-auto">
      <form>
        <div class="form-wrap">
          <div class="form-group">
            <label htmlFor="selectLiquid">select liquid</label>
            <select class="form-control"
              onInput={e => this.densityOfLiquid = (e.target as HTMLInputElement).value}>
              {
                densityOfLiquidOptions.map(({ value, label }) => (
                  <option value={value}>{label} ({ value})</option>
                ))
              }
              <option value="-1">Add your own liquid</option>
            </select>
          </div>
          <div class="form-group">
            <label htmlFor="">Density</label>
            <input
              type="number"
              class="form-control"
              value={this.customLiquid}
              onInput={e => this.customLiquid = (e.target as HTMLInputElement).value}
              disabled={this.densityOfLiquid != "-1"} /> g/cm <sup>3</sup>
          </div>
        </div>
        <div class="form-wrap">
          <div class="form-group">
            <label htmlFor="slectSolid">Example solid</label>
            <select class="form-control" onInput={e => this.densityOfSolid = (e.target as HTMLInputElement).value} >
              {
                densityOfSolidOptions.map(({ value, label }) => (
                  <option value={value}>{label} ({ value})</option>
                ))
              }
              <option value="-1">Add your own solid</option>
            </select>
          </div>
          <div class="form-group">
            <label htmlFor="">Density</label>
            <input
              type="number"
              class="form-control"
              value={this.customSolid}
              onInput={e => this.customSolid = (e.target as HTMLInputElement).value}
              disabled={this.densityOfSolid != "-1"} /> g/cm <sup>3</sup>
          </div>
        </div>
        <div class="form-group">
          <label htmlFor="volume">Volume</label>
          <input type="number" name="" id="volume" value="40" min="40" max="100" onInput={e => this.volumeOfSphere = (e.target as HTMLInputElement).value} />
        </div>
        <button type="button" class="btn-primary" onClick={() => this.onSubmit() }>submit</button>
        <button type="button" class="btn-primary" onClick={() => this.reset() }>refresh</button>
        <div class="svg-frame">
          <div class="water-displaced"><span>{ (parseFloat(this.volumeOfSphere) * parseFloat(this.densityOfSolid)).toFixed(2) }</span> gm</div>
          <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 1200">
            <defs>
              <filter id="luminosity-noclip" x="329.22" y="-8792" width="294.16" height="32766" filterUnits="userSpaceOnUse"
                color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask" x="329.22" y="-8792" width="294.16" height="32766" maskUnits="userSpaceOnUse">
                <g class="cls-86" />
              </mask>
              <radialGradient id="radial-gradient" cx="1228.63" cy="828.43" r="272.72"
                gradientTransform="matrix(-1.01, 0, 0, 1, 1702.71, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.3" />
                <stop offset="0.65" />
                <stop offset="0.71" stop-color="#232323" />
                <stop offset="0.83" stop-color="#7e7e7e" />
                <stop offset="1" stop-color="#fff" />
              </radialGradient>
              <filter id="luminosity-noclip-2" x="752.21" y="-8792" width="38.91" height="32766" filterUnits="userSpaceOnUse"
                color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-2" x="752.21" y="-8792" width="38.91" height="32766" maskUnits="userSpaceOnUse">
                <g class="cls-85" />
              </mask>
              <linearGradient id="linear-gradient" x1="897.58" y1="1002.29" x2="897.58" y2="889.74"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0" />
                <stop offset="0.36" stop-color="#666" />
                <stop offset="0.67" stop-color="#b8b8b8" />
                <stop offset="0.89" stop-color="#ebebeb" />
                <stop offset="1" stop-color="#fff" />
              </linearGradient>
              <filter id="luminosity-noclip-3" x="709.49" y="-8792" width="153.06" height="32766" filterUnits="userSpaceOnUse"
                color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-3" x="709.49" y="-8792" width="153.06" height="32766" maskUnits="userSpaceOnUse">
                <g class="cls-84" />
              </mask>
              <radialGradient id="radial-gradient-2" cx="914.43" cy="887.59" r="141.91" xlinkHref="#radial-gradient" />
              <linearGradient id="linear-gradient-2" x1="883.22" y1="912.67" x2="883.22" y2="1000.6"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.3" />
                <stop offset="0.86" />
                <stop offset="0.88" stop-color="#232323" />
                <stop offset="0.93" stop-color="#7e7e7e" />
                <stop offset="1" stop-color="#fff" />
              </linearGradient>
              <filter id="luminosity-noclip-5" x="819.86" y="-8792" width="51.13" height="32766" filterUnits="userSpaceOnUse"
                color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-5" x="819.86" y="-8792" width="51.13" height="32766" maskUnits="userSpaceOnUse">
                <g class="cls-83" />
              </mask>
              <linearGradient id="linear-gradient-3" x1="833.39" y1="912.4" x2="798.23" y2="912.4"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.43" />
                <stop offset="0.5" stop-color="#040404" />
                <stop offset="0.57" stop-color="#101010" />
                <stop offset="0.64" stop-color="#252525" />
                <stop offset="0.72" stop-color="#424242" />
                <stop offset="0.79" stop-color="#676767" />
                <stop offset="0.86" stop-color="#959595" />
                <stop offset="0.94" stop-color="#cacaca" />
                <stop offset="1" stop-color="#fff" />
              </linearGradient>
              <linearGradient id="linear-gradient-4" x1="833.39" y1="912.4" x2="798.23" y2="912.4"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.31" stop-color="#5b5b5b" />
                <stop offset="0.36" stop-color="#7a7a7a" />
                <stop offset="0.46" stop-color="#a9a9a9" />
                <stop offset="0.56" stop-color="#cecece" />
                <stop offset="0.64" stop-color="#e9e9e9" />
                <stop offset="0.72" stop-color="#f9f9f9" />
                <stop offset="0.78" stop-color="#fff" />
              </linearGradient>
              <linearGradient id="linear-gradient-5" x1="1192.94" y1="876.64" x2="1192.94" y2="1045.62"
                xlinkHref="#linear-gradient-2" />
              <filter id="luminosity-noclip-8" x="704.07" y="-8792" width="47.48" height="32766" filterUnits="userSpaceOnUse"
                color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-8" x="704.07" y="-8792" width="47.48" height="32766" maskUnits="userSpaceOnUse">
                <g class="cls-82" />
              </mask>
              <linearGradient id="linear-gradient-6" x1="929.23" y1="911.28" x2="964.71" y2="911.28"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.23" />
                <stop offset="0.31" stop-color="#111" />
                <stop offset="0.46" stop-color="#3c3c3c" />
                <stop offset="0.67" stop-color="#838383" />
                <stop offset="0.93" stop-color="#e3e3e3" />
                <stop offset="1" stop-color="#fff" />
              </linearGradient>
              <linearGradient id="linear-gradient-7" x1="929.23" y1="911.28" x2="964.71" y2="911.28"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0" />
                <stop offset="0.1" stop-color="#111" />
                <stop offset="0.29" stop-color="#3c3c3c" />
                <stop offset="0.57" stop-color="#838383" />
                <stop offset="0.91" stop-color="#e3e3e3" />
                <stop offset="1" stop-color="#fff" />
              </linearGradient>
              <filter id="luminosity-noclip-10" x="701.51" y="-8792" width="170.21" height="32766"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-10" x="701.51" y="-8792" width="170.21" height="32766" maskUnits="userSpaceOnUse">
                <g class="cls-81" />
              </mask>
              <linearGradient id="linear-gradient-8" x1="882.62" y1="828.67" x2="882.62" y2="819.95"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.63" />
                <stop offset="0.73" stop-color="#4c4c4c" />
                <stop offset="0.86" stop-color="#acacac" />
                <stop offset="0.96" stop-color="#e8e8e8" />
                <stop offset="1" stop-color="#fff" />
              </linearGradient>
              <filter id="luminosity-noclip-11" x="701.5" y="-8792" width="169.6" height="32766" filterUnits="userSpaceOnUse"
                color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-11" x="701.5" y="-8792" width="169.6" height="32766" maskUnits="userSpaceOnUse">
                <g class="cls-80" />
              </mask>
              <linearGradient id="linear-gradient-9" x1="882.93" y1="817.96" x2="882.93" y2="831.6"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.15" />
                <stop offset="0.91" stop-color="#fff" />
              </linearGradient>
              <filter id="luminosity-noclip-12" x="313.89" y="-8792" width="327.11" height="32766"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-12" x="313.89" y="-8792" width="327.11" height="32766" maskUnits="userSpaceOnUse">
                <g class="cls-79" />
              </mask>
              <linearGradient id="linear-gradient-10" x1="1191.79" y1="616.91" x2="1191.79" y2="600.14"
                xlinkHref="#linear-gradient-8" />
              <filter id="luminosity-noclip-13" x="313.87" y="-8792" width="325.95" height="32766"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-13" x="313.87" y="-8792" width="325.95" height="32766" maskUnits="userSpaceOnUse">
                <g class="cls-78" />
              </mask>
              <linearGradient id="linear-gradient-11" x1="1192.39" y1="596.33" x2="1192.39" y2="622.54"
                xlinkHref="#linear-gradient-9" />
              <linearGradient id="linear-gradient-12" x1="897.58" y1="1002.29" x2="897.58" y2="889.74"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0" />
                <stop offset="0.08" stop-color="#222" />
                <stop offset="0.22" stop-color="#5c5c5c" />
                <stop offset="0.36" stop-color="#8e8e8e" />
                <stop offset="0.5" stop-color="#b7b7b7" />
                <stop offset="0.64" stop-color="#d6d6d6" />
                <stop offset="0.77" stop-color="#ededed" />
                <stop offset="0.89" stop-color="#fafafa" />
                <stop offset="1" stop-color="#fff" />
              </linearGradient>
              <clipPath id="clip-path">
                <path class="cls-26"
                  d="M623.33,616.11l9,.6,7.52,2.62-.23,5.45s-8.81.13-12.17,3.68a14,14,0,0,0-4.09,9v371.83c0,21.3-18.4,38.58-39.61,38.58H367.59a38.5,38.5,0,0,1-38.42-38.58V635.78a16.54,16.54,0,0,0-3-9.4c-3-4.23-6-4-6-4v-5.72l9-.57Z" />
              </clipPath>
              <linearGradient id="linear-gradient-13" x1="641.01" y1="831.8" x2="313.43" y2="831.8"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#1000bd" />
                <stop offset="0.02" stop-color="#1c13ca" />
                <stop offset="0.06" stop-color="#2d2fdd" />
                <stop offset="0.1" stop-color="#3b45ec" />
                <stop offset="0.15" stop-color="#4555f7" />
                <stop offset="0.2" stop-color="#4a5efd" />
                <stop offset="0.27" stop-color="#4c61ff" />
                <stop offset="0.4" stop-color="#667eff" />
                <stop offset="0.67" stop-color="#a3c5ff" />
                <stop offset="0.7" stop-color="#9cbbfc" />
                <stop offset="0.75" stop-color="#87a1f3" />
                <stop offset="0.83" stop-color="#6776e4" />
                <stop offset="0.91" stop-color="#3a3bd0" />
                <stop offset="0.98" stop-color="#1003bd" />
              </linearGradient>
              <clipPath id="clip-path-2">
                <path class="cls-26"
                  d="M862.52,828.58s2.74,0,3.64.12a19.12,19.12,0,0,1,4.71,1.27,12,12,0,0,0-6.1,1.79c-2.76,1.77-2.25,5.44-2.25,5.44v89.51c0,11.09-9.57,20.08-20.61,20.08H729.46a20,20,0,0,1-20-20.08V837.09a10.66,10.66,0,0,0-2-7c-.57-.79-2.88-1.6-2.88-1.6l4.85.08Z" />
              </clipPath>
              <linearGradient id="linear-gradient-14" x1="870.87" y1="887.97" x2="702.58" y2="887.97"
                xlinkHref="#linear-gradient-13" />
              <linearGradient id="linear-gradient-15" x1="523.69" y1="476.27" x2="443.69" y2="476.27"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.19" stop-color="#e12617" />
                <stop offset="0.4" stop-color="#eb4630" />
                <stop offset="0.89" stop-color="#ef634d" />
                <stop offset="0.94" stop-color="#ef6751" />
              </linearGradient>
              <linearGradient id="linear-gradient-16" x1="746.64" y1="831.68" x2="320.17" y2="831.68"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#1c1c1c" />
                <stop offset="0.02" stop-color="#353535" />
                <stop offset="0.06" stop-color="#545454" />
                <stop offset="0.09" stop-color="#676767" />
                <stop offset="0.11" stop-color="#6e6e6e" />
                <stop offset="0.27" stop-color="#a6a6a6" />
                <stop offset="0.46" stop-color="#e5e5e5" />
                <stop offset="0.54" stop-color="#e5e5e5" />
                <stop offset="0.55" stop-color="#e5e5e5" />
                <stop offset="0.65" stop-color="#e2e2e2" />
                <stop offset="0.73" stop-color="#d7d7d7" />
                <stop offset="0.81" stop-color="#c6c6c6" />
                <stop offset="0.89" stop-color="#aeaeae" />
                <stop offset="0.92" stop-color="#a1a1a1" />
                <stop offset="0.95" stop-color="#9e9e9e" />
                <stop offset="0.97" stop-color="#959595" />
                <stop offset="0.98" stop-color="#868686" />
                <stop offset="1" stop-color="#717171" />
                <stop offset="1" stop-color="#6e6e6e" />
              </linearGradient>
              <filter id="luminosity-noclip-15" x="329.22" y="899.45" width="294.16" height="148.45"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-15" x="329.22" y="899.45" width="294.16" height="148.45" maskUnits="userSpaceOnUse">
                <g class="cls-1">
                  <path class="cls-2"
                    d="M623.38,899.45v109.87c0,21.3-18.4,38.58-39.62,38.58H367.64a38.5,38.5,0,0,1-38.42-38.58V899.45Z" />
                </g>
              </mask>
              <radialGradient id="radial-gradient-3" cx="1228.63" cy="828.43" r="272.72"
                gradientTransform="matrix(-1.01, 0, 0, 1, 1702.71, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.3" stop-color="#fff" />
                <stop offset="0.65" stop-color="#fff" />
                <stop offset="0.76" stop-color="#dcdcdc" />
                <stop offset="1" stop-color="#858585" />
              </radialGradient>
              <filter id="luminosity-noclip-16" x="329.22" y="869.59" width="294.16" height="177.9"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-16" x="329.22" y="869.59" width="294.16" height="177.9" maskUnits="userSpaceOnUse">
                <g class="cls-12">
                  <path class="cls-13"
                    d="M623.38,869.59v139.32c0,21.3-18.4,38.58-39.62,38.58H367.64a38.5,38.5,0,0,1-38.42-38.58V877.72C447.34,877.72,574.11,874,623.38,869.59Z" />
                </g>
              </mask>
              <linearGradient id="linear-gradient-17" x1="1192.94" y1="876.64" x2="1192.94" y2="1045.62"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.3" stop-color="#fff" />
                <stop offset="0.86" stop-color="#fff" />
                <stop offset="0.9" stop-color="#dcdcdc" />
                <stop offset="1" stop-color="#858585" />
              </linearGradient>
              <linearGradient id="linear-gradient-18" x1="1037.62" y1="626.38" x2="1338.52" y2="626.38"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#6e6e6e" />
                <stop offset="0.03" stop-color="#7a7a7a" />
                <stop offset="0.15" stop-color="#a9a9a9" />
                <stop offset="0.27" stop-color="#cecece" />
                <stop offset="0.38" stop-color="#e9e9e9" />
                <stop offset="0.47" stop-color="#f9f9f9" />
                <stop offset="0.55" stop-color="#fff" />
                <stop offset="0.61" stop-color="#fafafa" />
                <stop offset="0.69" stop-color="#ebebeb" />
                <stop offset="0.77" stop-color="#d3d3d3" />
                <stop offset="0.86" stop-color="#b1b1b1" />
                <stop offset="0.89" stop-color="#a1a1a1" />
                <stop offset="1" stop-color="#6e6e6e" />
              </linearGradient>
              <linearGradient id="linear-gradient-19" x1="1190.31" y1="599.37" x2="1190.31" y2="620.31"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.37" stop-color="#f2f2f2" />
                <stop offset="1" stop-color="#b8b8b8" />
              </linearGradient>
              <filter id="luminosity-noclip-17" x="313.89" y="601.66" width="327.11" height="4.95"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-17" x="313.89" y="601.66" width="327.11" height="4.95" maskUnits="userSpaceOnUse">
                <g class="cls-21">
                  <path class="cls-22" d="M313.89,606.62a7.6,7.6,0,0,1,7.14-5h301.7c12.26,0,14.9,2.12,18.28,5Z" />
                </g>
              </mask>
              <linearGradient id="linear-gradient-20" x1="1191.79" y1="616.91" x2="1191.79" y2="600.14"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.63" stop-color="#fff" />
                <stop offset="0.78" stop-color="#c1c1c1" />
                <stop offset="0.93" stop-color="#858585" />
                <stop offset="1" stop-color="#6e6e6e" />
              </linearGradient>
              <filter id="luminosity-noclip-18" x="313.87" y="611.65" width="325.95" height="7.75"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-18" x="313.87" y="611.65" width="325.95" height="7.75" maskUnits="userSpaceOnUse">
                <g class="cls-23">
                  <path class="cls-24"
                    d="M317.28,612.66H629.33c6,0,8,1.41,9.26,3.14.21.3,2.42,3.61.36,3.61-4.41,0,.3-2.74-21.83-2.74H321a7.58,7.58,0,0,1-7.16-5h.33A4.86,4.86,0,0,0,317.28,612.66Z" />
                </g>
              </mask>
              <linearGradient id="linear-gradient-21" x1="1192.39" y1="596.33" x2="1192.39" y2="622.54"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.15" stop-color="#fff" />
                <stop offset="0.91" stop-color="#6e6e6e" />
              </linearGradient>
              <linearGradient id="linear-gradient-22" x1="802.4" y1="886.21" x2="958.97" y2="886.21"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" xlinkHref="#linear-gradient-16" />
              <mask id="mask-19" x="752.21" y="867.36" width="38.91" height="121.48" maskUnits="userSpaceOnUse">
                <g class="cls-3">
                  <path class="cls-25"
                    d="M790.58,867.36c.81,119.14,3.55,121.49-19.6,121.49-22.26,0-19,.72-18.08-121.49Z" />
                </g>
              </mask>
              <filter id="luminosity-noclip-19" x="752.21" y="867.36" width="38.91" height="121.48"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <linearGradient id="linear-gradient-23" x1="897.58" y1="955.59" x2="897.58" y2="882"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#f6f6f5" />
                <stop offset="1" stop-color="#fff" />
              </linearGradient>
              <filter id="luminosity-noclip-20" x="709.49" y="924.54" width="153.06" height="77.24"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-21" x="709.49" y="924.54" width="153.06" height="77.24" maskUnits="userSpaceOnUse">
                <g class="cls-5">
                  <path class="cls-6"
                    d="M862.55,924.54v57.17c0,11.09-9.57,20.08-20.61,20.08H729.48a20,20,0,0,1-20-20.08V924.54Z" />
                </g>
              </mask>
              <radialGradient id="radial-gradient-4" cx="914.43" cy="913.65" r="80.11" xlinkHref="#radial-gradient-3" />
              <filter id="luminosity-noclip-21" x="709.49" y="909.01" width="153.06" height="92.57"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-22" x="709.49" y="909.01" width="153.06" height="92.57" maskUnits="userSpaceOnUse">
                <g class="cls-7">
                  <path class="cls-8"
                    d="M862.55,909V981.5c0,11.08-9.57,20.07-20.61,20.07H729.48a20,20,0,0,1-20-20.07V913.24C771,913.24,836.91,911.28,862.55,909Z" />
                </g>
              </mask>
              <linearGradient id="linear-gradient-24" x1="883.22" y1="910.51" x2="883.22" y2="946.68"
                xlinkHref="#linear-gradient-17" />
              <linearGradient id="linear-gradient-25" x1="802.4" y1="830.77" x2="958.97" y2="830.77"
                xlinkHref="#linear-gradient-18" />
              <mask id="mask-23" x="819.86" y="825.97" width="51.13" height="172.85" maskUnits="userSpaceOnUse">
                <g class="cls-9">
                  <path class="cls-10"
                    d="M837.45,966.9c0-38.23.09-118.7.13-140.93h25s6.91,2.44,8.42,3.51a2.57,2.57,0,0,0,0,.48h-.12c-9,.54-8.32,6.44-8.32,6.44v128.1c0,40.7-20.79,33.88-42.06,33.88C816,998.39,837.45,994.52,837.45,966.9Z" />
                </g>
              </mask>
              <filter id="luminosity-noclip-22" x="819.86" y="825.97" width="51.13" height="172.85"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <linearGradient id="linear-gradient-26" x1="833.39" y1="885.15" x2="798.23" y2="885.15"
                gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                <stop offset="0.31" stop-color="#f7f7f6" />
                <stop offset="0.42" stop-color="#fafaf9" />
                <stop offset="0.78" stop-color="#fff" />
              </linearGradient>
              <mask id="mask-25" x="704.07" y="824.86" width="47.48" height="172.85" maskUnits="userSpaceOnUse">
                <g class="cls-14">
                  <path class="cls-15"
                    d="M734,965.78c0-38.22-.1-118.69-.13-140.92H709.49s-7.75,2.53-4.71,3.71a7.58,7.58,0,0,1,4.71,6.74V963.39c0,40.71,20.16,33.89,41.44,33.89C755.47,997.28,734,993.41,734,965.78Z" />
                </g>
              </mask>
              <filter id="luminosity-noclip-23" x="704.07" y="824.86" width="47.48" height="172.85"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <linearGradient id="linear-gradient-27" x1="929.23" y1="884.04" x2="964.71" y2="884.04"
                xlinkHref="#linear-gradient-23" />
              <linearGradient id="linear-gradient-28" x1="881.85" y1="819.54" x2="881.85" y2="830.44"
                xlinkHref="#linear-gradient-19" />
              <filter id="luminosity-noclip-24" x="701.51" y="820.74" width="170.21" height="2.58"
                filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-27" x="701.51" y="820.74" width="170.21" height="2.58" maskUnits="userSpaceOnUse">
                <g class="cls-17">
                  <path class="cls-18" d="M701.51,823.31a4,4,0,0,1,3.72-2.57h157c6.38,0,7.75,1.1,9.51,2.57Z" />
                </g>
              </mask>
              <linearGradient id="linear-gradient-29" x1="882.62" y1="828.67" x2="882.62" y2="819.95"
                xlinkHref="#linear-gradient-20" />
              <filter id="luminosity-noclip-25" x="701.5" y="825.93" width="169.6" height="4.03" filterUnits="userSpaceOnUse"
                color-interpolation-filters="s-rGB">
                <feFlood flood-color="#fff" result="bg" />
                <feBlend in="SourceGraphic" in2="bg" />
              </filter>
              <mask id="mask-28" x="701.5" y="825.93" width="169.6" height="4.03" maskUnits="userSpaceOnUse">
                <g class="cls-19">
                  <path class="cls-20"
                    d="M703.28,826.46H865.64c3.15,0,4.19.73,4.82,1.63.11.16,1.26,1.88.19,1.88-2.29,0,.16-1.42-11.35-1.42H705.23a3.94,3.94,0,0,1-3.73-2.61h.17A2.49,2.49,0,0,0,703.28,826.46Z" />
                </g>
              </mask>
              <linearGradient id="linear-gradient-30" x1="882.93" y1="817.96" x2="882.93" y2="831.6"
                xlinkHref="#linear-gradient-21" />
            </defs>
            <g class="cls-27">
              <g id="Layer_0" data-name="Layer 0">
                <g id="Layer_7" data-name="Layer 7">
                  <g class="cls-30">
                    <rect ref={el => this.smallBeaker = el as SVGElement} class="cls-" fill={liquidColor} x="702.58" y="947" width="168.29" height="120.03" />
                  </g>
                </g>
                <g id="Layer_6" data-name="Layer 6">
                  <path class="cls-32"
                    d="M495.45,422.21a4.6,4.6,0,0,0-4.22-2.75,4.26,4.26,0,0,0-.61,0,4.68,4.68,0,0,0-3.88,3.22L485,428.17v-204h-2.35V430.9l-4.41-6.15a4.72,4.72,0,0,0-4.69-1.87l-.35.08,0,0a4.67,4.67,0,0,0-1.16,8.5l8.37,5c.66-.05,1.32-.09,2-.12h.1l1.14,0h.2l1.3,0,0,0,0,0c.49,0,1,0,1.47.08h0l8.08-9.25A4.61,4.61,0,0,0,495.45,422.21Zm-22.21,7.25a2.31,2.31,0,0,1,.74-4.25l.15,0a2.33,2.33,0,0,1,2.19,1l6.33,8.81v0h0l.11.15,0,0Zm19.7-3.79-7.36,8.44,3.4-10.68a2.33,2.33,0,0,1,1.94-1.59l.31,0a2.33,2.33,0,0,1,1.71,3.85Z" />
                </g>
                <g id="Layer_5" data-name="Layer 5" >
                  <circle ref={el => this.ballRef = el as SVGElement} fill={solidColor} class="cls-" cx="483.69" cy="476.27" r="40" />
                </g>
                <g id="Layer_4" data-name="Layer 4">
                  <path class="cls-34"
                    d="M611.33,313.6c-2.3-6.79-38.65-.68-77.48-7.92h-.05c-5.17-1.49-88-31.08-113.7-26l109.35,35.74,0,.05c3.85,1,18.49,3.31,22.35,3.91,3.94,9.33,4.63,13.5,14,16.15s25.57,5,33.72-2.51C603.74,329.06,612.58,317.3,611.33,313.6Zm-8.67,6.15c-2.71,4.32-7.33,11.55-12.85,12.55s-22.4-.4-25.72-2.91-5.63-8.74-4.72-11.05,5.22-2.91,7.53-3.11c4.21-.37,29.64-.11,31.85.5S605.38,315.43,602.66,319.75Z" />
                  <path class="cls-35"
                    d="M525.05,299.69,503,302l-84.7,10.5,2.54,2.6c33.07,2.9,71.41,1.24,108.7.49l2.89-6.81Z" />
                  <path class="cls-36" d="M418.25,312.48l1.89,1.93q38.72,0,82-3.13l.72-9.26Z" />
                  <path class="cls-37"
                    d="M586.58,265.2c-6.65-6.93-15.05-7.32-23.92-4-7.35,2.73-15.95,11.66-9.92,26-7.94,3.61-16.21,7.3-27.63,12.56,0,0,5,6.42,7.27,9,7.9-4.08,21.36-9.71,34.52-15.13,13.46-5.63,21.81-12.74,23-17.81S589.23,268,586.58,265.2Zm-9.33,16.57c-3.52,2.52-10,6.94-14.26,5.93s-6.74-5.05-6.53-9.34c-.61-7.74,8-13.86,15.77-14.17s10.57,4,12.08,7.92S580.77,279.26,577.25,281.77Z" />
                  <path class="cls-38" d="M519.75,303.09a4.71,4.71,0,1,1-5.42,4,4.76,4.76,0,0,1,5.42-4Z" />
                  <path class="cls-39"
                    d="M519.75,303.09a5,5,0,0,1,.58.12L519,312.46a3.9,3.9,0,0,1-.59,0,5.41,5.41,0,0,1-.58-.12l1.32-9.25a3.9,3.9,0,0,1,.59,0Z" />
                </g>
                <g id="Layer_3" data-name="Layer 3">
                  <path class="cls-40"
                    d="M761.54,970.24s46.48-6,51.68,27.89c5.18,33.68-33.7,33.71-33.7,33.71l-39.3,3.6,4.42,1.25h83.45s6.86,1.33,7-5.34S815,970.47,815,970.47s-4.25-2.12-11.78-2.12h-39Z" />
                  <path
                    d="M761.35,1038.7c-.41,1.41-.8,2.54-1.06,3.69-.7,3.16-2,5.21-5.86,5.1-3.6-.11-4.93-1.89-5.44-5-.38-2.36-1.23-3.79-4.3-3.91-6.21-.24-10.1-6.36-7.92-12.41,6.46-18,13.11-35.89,19.8-53.79a7.25,7.25,0,0,1,7.42-5c5.3.06,10.59,0,16.13,0V957.2c-7.75,0-63.33.07-71,0a12.56,12.56,0,0,1-12.46-10.29c-.66-3.27.25-5.86,3.57-7.06,2.68-1,4.88.92,6.4,4.35.58,1.31,2.49,2.88,3.81,2.9,18.63.18,133.07.11,151.69.14,2.38,0,3.67-.88,4.1-3.32.55-3.1,2.67-4.74,5.73-4.13s4.48,3.06,4.13,6.29a12.61,12.61,0,0,1-12.55,11.12c-7.57.1-63.06,0-71,0v10.18c5.28,0,10.44.08,15.6,0,4.17-.08,6.76,1.89,8.15,5.68,6.42,17.43,12.88,34.84,19.22,52.3,2.57,7.06-1,12.87-8.36,13.26-3.28.17-3.17,2.38-3.57,4.22-.72,3.25-2.33,4.72-5.79,4.66-3.1-.06-4.89-1.35-5.17-4.29-.37-4-2.58-4.61-6.16-4.56C791.6,1038.81,776.7,1038.7,761.35,1038.7Zm25-2.13c12.89,0,25.78,0,38.68,0,7.66,0,10.68-4.26,8.1-11.34-6.19-16.93-12.48-33.82-18.63-50.77-1.34-3.7-3.74-5.12-7.54-5.09-13.69.08-27.38.1-41.07,0-4.18,0-6.55,1.59-8,5.6-6,16.59-11.89,33.2-18.38,49.59-3,7.46,1.31,12.37,8.55,12.15C760.84,1036.29,773.61,1036.58,786.37,1036.57Zm-.46-81.64c9.84,0,67.59.08,77.44,0,5.73-.07,10.23-4,10.28-9,0-1.29-1.43-2.6-2.21-3.9-1.06.93-2.8,1.71-3.06,2.83-.78,3.41-2.76,4.5-6,4.49-18.76,0-133.34,0-152.1,0-3.23,0-5.22-1.06-6-4.46-.27-1.13-2-1.92-3-2.86-.78,1.3-2.24,2.61-2.23,3.9,0,5,4.57,8.93,10.28,9C718.84,955,776.33,954.93,785.91,954.93Zm3.72,12.31v-9.69h-6.57v9.69Zm-39.14,71.67c1,2.48-.43,5.84,3.72,6.14,4.76.35,3.38-3.57,4.64-6.14Zm62.73-.05c1.95,2.74.58,6.94,5.4,6.17,3.79-.61,2.73-3.64,3.29-6.17Z" />
                  <path
                    d="M786.3,1028.62A25.66,25.66,0,1,1,812,1003.1,25.62,25.62,0,0,1,786.3,1028.62Zm1.44-2.31c12.39-1.22,21-9.87,21.84-21.84l0-2.79c-1-12.44-11.37-22.82-21.88-21.95h-2.86c-12.13.95-21,9.9-21.84,21.86l0,2.87c1,12.21,9.71,20.83,21.86,21.82" />
                  <line class="cls-41" x1="739.65" y1="1033" x2="834.15" y2="1033" />
                  <line class="cls-42" x1="761.22" y1="975.5" x2="757.65" y2="985.23" />
                  <line class="cls-43" x1="815.22" y1="986.62" x2="824.93" y2="1013.46" />
                  <line class="cls-43" x1="817.57" y1="1003.64" x2="821.5" y2="1014.25" />
                  <path
                    d="M782.69,1002.74a7.21,7.21,0,0,1-1.22,4.51,4.89,4.89,0,0,1-7.13,0,7,7,0,0,1-1.26-4.39v-2.62a7.12,7.12,0,0,1,1.23-4.52,4.88,4.88,0,0,1,7.12,0,7,7,0,0,1,1.26,4.39Zm-2.82-2.88a5.17,5.17,0,0,0-.49-2.57,1.8,1.8,0,0,0-3,0,4.94,4.94,0,0,0-.5,2.4v3.46a5.51,5.51,0,0,0,.47,2.58,1.62,1.62,0,0,0,1.52.85,1.6,1.6,0,0,0,1.5-.81,5.52,5.52,0,0,0,.48-2.49Z" />
                  <path
                    d="M784.86,1007.23a1.42,1.42,0,0,1,.45-1.09,1.76,1.76,0,0,1,2.28,0,1.39,1.39,0,0,1,.46,1.09,1.41,1.41,0,0,1-.45,1.08,1.61,1.61,0,0,1-1.15.42,1.63,1.63,0,0,1-1.15-.42A1.4,1.4,0,0,1,784.86,1007.23Z" />
                  <path
                    d="M800,1002.74a7.15,7.15,0,0,1-1.22,4.51,4.25,4.25,0,0,1-3.57,1.56,4.3,4.3,0,0,1-3.56-1.53,7,7,0,0,1-1.26-4.39v-2.62a7.12,7.12,0,0,1,1.24-4.52,4.87,4.87,0,0,1,7.11,0,7,7,0,0,1,1.26,4.39Zm-2.82-2.88a5.19,5.19,0,0,0-.48-2.57,1.65,1.65,0,0,0-1.51-.81,1.6,1.6,0,0,0-1.47.77,4.83,4.83,0,0,0-.5,2.4v3.46a5.38,5.38,0,0,0,.47,2.58,1.6,1.6,0,0,0,1.52.85,1.57,1.57,0,0,0,1.49-.81,5.26,5.26,0,0,0,.48-2.49Z" />
                  <path
                    d="M779.37,1016.14A3.41,3.41,0,0,1,780,1014a2.17,2.17,0,0,1,3.32-.05l0-.65h.91V1019a2.37,2.37,0,0,1-.67,1.77,2.46,2.46,0,0,1-1.8.65,3.12,3.12,0,0,1-1.23-.26,2.21,2.21,0,0,1-.92-.74l.52-.6a1.94,1.94,0,0,0,1.56.79,1.48,1.48,0,0,0,1.13-.41,1.54,1.54,0,0,0,.41-1.14v-.5a2.07,2.07,0,0,1-1.63.68,2,2,0,0,1-1.65-.82A3.59,3.59,0,0,1,779.37,1016.14Zm1,.11a2.62,2.62,0,0,0,.4,1.55,1.33,1.33,0,0,0,1.13.56,1.46,1.46,0,0,0,1.38-.85v-2.66a1.48,1.48,0,0,0-1.37-.83,1.32,1.32,0,0,0-1.13.56A2.8,2.8,0,0,0,780.37,1016.25Z" />
                  <path
                    d="M786.71,1013.28l0,.65a2.14,2.14,0,0,1,1.72-.75,1.66,1.66,0,0,1,1.66.93,2.27,2.27,0,0,1,.76-.68,2.2,2.2,0,0,1,1.09-.25c1.28,0,1.93.67,1.95,2v3.9h-1v-3.84a1.34,1.34,0,0,0-.28-.93,1.24,1.24,0,0,0-1-.31,1.29,1.29,0,0,0-.91.33,1.33,1.33,0,0,0-.43.89v3.86h-1v-3.81a1.11,1.11,0,0,0-1.24-1.27,1.34,1.34,0,0,0-1.34.83v4.25h-1v-5.82Z" />
                </g>
                <g id="Layer_2" data-name="Layer 2">
                  <path class="cls-44"
                    d="M746.64,796.36l-7.48,7L623.33,733.11v276.21c0,21.3-18.4,38.58-39.62,38.58H367.59a38.5,38.5,0,0,1-38.42-38.58v-374c-.92-11.21-9-13-9-13v-5.72l10.85,0c.09-.29.19-.56.29-.85H621.19c.1.29,12.82-.54,12.91-.25l5.72,3.8v3.32a6,6,0,0,0-.23,2.45c-1.94,0-16.26.71-16.26,12.39v43.39Z" />
                  <g class="cls-45">
                    <path class="cls-46"
                      d="M623.38,899.45v109.87c0,21.3-18.4,38.58-39.62,38.58H367.64a38.5,38.5,0,0,1-38.42-38.58V899.45Z" />
                  </g>
                  <g class="cls-47">
                    <path class="cls-48"
                      d="M623.38,869.59v139.32c0,21.3-18.4,38.58-39.62,38.58H367.64a38.5,38.5,0,0,1-38.42-38.58V877.72C447.34,877.72,574.11,874,623.38,869.59Z" />
                  </g>
                  <g class="cls-49">
                    <path class="cls-50"
                      d="M331,616.38c.09-.29.2-.56.29-.85H621.19c.1.29,11.59.29,11.68.58l7,3-.16,3.95a6.05,6.05,0,0,0-.07,1.75v0s-16.31-.26-16.26,12.43c0,0-11.59-12.69-147.7-12.69-143.84,0-146.46,10.57-146.46,10.57-.92-11.21-9-13-9-13v-5.73Z" />
                  </g>
                  <path class="cls-51"
                    d="M313.43,609.17a7.55,7.55,0,0,0,7.6,7.5H617.12c22.13,0,17.23,2.74,21.83,2.74,9.68,0,7.07-17.75-12.19-17.75H321a7.56,7.56,0,0,0-7.6,7.51Z" />
                  <g class="cls-52">
                    <path class="cls-53" d="M313.89,606.62a7.6,7.6,0,0,1,7.14-5h301.7c12.26,0,14.9,2.12,18.28,5Z" />
                  </g>
                  <g class="cls-54">
                    <path class="cls-55"
                      d="M317.28,612.66H629.33c6,0,8,1.41,9.26,3.14.21.3,2.42,3.61.36,3.61-4.41,0,.3-2.74-21.83-2.74H321a7.58,7.58,0,0,1-7.16-5h.33A4.86,4.86,0,0,0,317.28,612.66Z" />
                  </g>
                  <g class="cls-56">
                    <path class="cls-57"
                      d="M328.53,605.82l3.59.25,10.18.67c4.37.27,9.7.58,15.8.89,3,.16,6.3.36,9.72.5,1.71.08,3.46,0,5.26,0l5.51,0,110.13-.31,58.82-.17,27.06-.07c8.6,0,16.74-.11,24.24,0,1.88,0,3.72-.14,5.52-.25l5.26-.3,9.71-.59c3-.18,5.93-.42,8.52-.52a32.13,32.13,0,0,1,7.06.61,13.08,13.08,0,0,1,5.18,2.15,5.91,5.91,0,0,1,2.26,3.4,7.47,7.47,0,0,1,.09,2.62,8.61,8.61,0,0,1-.16.91,7.66,7.66,0,0,0,.24-.89,7.51,7.51,0,0,0,.13-2.7,6.39,6.39,0,0,0-2.13-3.85,13.68,13.68,0,0,0-5.32-2.78,32.5,32.5,0,0,0-7.31-1.22c-2.68-.08-5.5-.31-8.57-.47l-9.71-.53-5.27-.27c-1.79-.09-3.63-.23-5.51-.22-7.51.13-15.64.07-24.25.12l-27.06.08L488.7,603l-110.12.32h-5.51c-1.8,0-3.55-.09-5.27,0-3.42.16-6.66.37-9.72.55-6.09.34-11.41.69-15.79,1l-10.17.72Z" />
                  </g>
                  <path class="cls-58"
                    d="M710.42,825.56c.05-.15.11-.29.16-.44H861.41c.05.15.11.29.15.44l9.55,1.41v1.72A2.92,2.92,0,0,0,871,830c-1,0-8.47.37-8.47,6.44v90.81c0,11.09-9.57,20.08-20.61,20.08H729.46a20,20,0,0,1-20-20.08V835.31c-.48-5.83-4.68-6.74-4.68-6.74v-3Z" />
                  <g class="cls-59">
                    <g class="cls-59">
                      <path class="cls-60" d="M790.58,867.36c.81,119.14,3.55,67-19.6,67-22.26,0-19,55.21-18.08-67Z" />
                    </g>
                  </g>
                  <path class="cls-61" d="M790.44,834.28c0,11,.06,22.17.11,31H752.94c0-8.82.1-20,.12-31Z" />
                  <rect class="cls-62" x="779.6" y="834.28" width="5.89" height="30.99" />
                  <path class="cls-57" d="M778.61,868.24h7.06v50.85c0,5-7.06,3.11-7.06-9.29Z" />
                  <g class="cls-63">
                    <path class="cls-64"
                      d="M862.55,924.54v2.68c0,11.09-9.57,20.08-20.61,20.08H729.48a20,20,0,0,1-20-20.08v-2.68Z" />
                  </g>
                  <g class="cls-65">
                    <path class="cls-66"
                      d="M862.55,909v18c0,11.09-9.57,20.08-20.61,20.08H729.48a20,20,0,0,1-20-20.08V913.24C771,913.24,836.91,911.28,862.55,909Z" />
                  </g>
                  <g class="cls-49">
                    <path class="cls-67"
                      d="M710.42,825.56c.05-.15.11-.29.16-.44H861.41c.05.15.11.29.15.44l9.55,1.41-.09,2a3.09,3.09,0,0,0,0,.91v0s-8.48-.14-8.46,6.46c0,0-6-6.6-76.85-6.6-74.84,0-76.21,5.5-76.21,5.5-.48-5.83-4.68-6.74-4.68-6.74v-3Z" />
                  </g>
                  <g class="cls-68">
                    <g class="cls-68">
                      <path class="cls-69"
                        d="M837.45,912.41c0-38.23.09-64.21.13-86.44h25s6.91,2.44,8.42,3.51a2.57,2.57,0,0,0,0,.48h-.12c-9,.54-8.32,6.44-8.32,6.44V910c0,40.7-20.79,33.88-42.06,33.88C816,943.9,837.45,940,837.45,912.41Z" />
                    </g>
                  </g>
                  <g class="cls-70">
                    <g class="cls-70">
                      <path class="cls-71"
                        d="M734,911.29c0-38.22-.1-64.2-.13-86.43H709.49s-7.75,2.53-4.71,3.71a7.58,7.58,0,0,1,4.71,6.74v73.6c0,40.7,20.16,33.88,41.44,33.88C755.47,942.79,734,938.92,734,911.29Z" />
                    </g>
                  </g>
                  <path class="cls-72"
                    d="M701.27,824.64a3.94,3.94,0,0,0,4,3.91H859.3c11.51,0,9,1.42,11.35,1.42,5,0,3.68-9.23-6.34-9.23H705.23a3.94,3.94,0,0,0-4,3.9Z" />
                  <g class="cls-73">
                    <path class="cls-74" d="M701.51,823.31a4,4,0,0,1,3.72-2.57h157c6.38,0,7.75,1.1,9.51,2.57Z" />
                  </g>
                  <g class="cls-75">
                    <path class="cls-76"
                      d="M703.28,826.46H865.64c3.15,0,4.19.73,4.82,1.63.11.16,1.26,1.88.19,1.88-2.29,0,.16-1.42-11.35-1.42H705.23a3.94,3.94,0,0,1-3.73-2.61h.17A2.49,2.49,0,0,0,703.28,826.46Z" />
                  </g>
                  <g class="cls-56">
                    <path class="cls-57"
                      d="M709.13,822.9,711,823l5.29.35c2.28.14,5.05.3,8.22.46,1.59.09,3.28.19,5.06.26.89,0,1.8,0,2.74,0h2.87l57.3-.16,30.61-.09,14.08,0c4.47,0,8.71,0,12.61,0,1,0,1.94-.07,2.87-.13l2.74-.15,5.05-.31c1.59-.09,3.09-.22,4.44-.27a16.72,16.72,0,0,1,3.67.32,6.7,6.7,0,0,1,2.69,1.12,3,3,0,0,1,1.18,1.76,3.86,3.86,0,0,1,.05,1.37,4.57,4.57,0,0,1-.08.47s.05-.15.12-.46a4.2,4.2,0,0,0,.07-1.41,3.37,3.37,0,0,0-1.11-2,7,7,0,0,0-2.77-1.44,16.91,16.91,0,0,0-3.8-.64c-1.4,0-2.87-.16-4.46-.24l-5.06-.28-2.74-.14c-.93-.05-1.88-.12-2.86-.11-3.91.06-8.14,0-12.62.06l-14.08,0-30.61.09-57.3.16h-2.86c-.94,0-1.85,0-2.75,0-1.78.09-3.46.2-5,.29-3.17.18-5.94.36-8.22.51l-5.29.38Z" />
                  </g>
                </g>
                <g id="Layer_1" data-name="Layer 1">
                  <rect class="cls-77" y="215.44" width="1200" height="8.69" />
                </g>
                <g id="Layer_8" data-name="Layer 8">
                  <g class="cls-28">
                    <rect class="cls-" x="313.43" y="733" width="327.57" height="431.38" fill={liquidColor} />
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
      </form>
    </div>
  }
}
