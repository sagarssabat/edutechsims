import { Component, h, State, Watch, Prop } from '@stencil/core';
import { TimelineMax } from 'gsap';

@Component({
  tag: 'density-sim',
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
        <div class="row">
          <div class="col-md-6">
            <div class="form-wrap">
              <div class="form-group">
                <label htmlFor="selectLiquid">select liquid</label>
                <select class="form-control col-md-9"
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
                  disabled={this.densityOfSolid != "-1"} />
                  <span>g/cm <sup>3</sup></span>
              </div>
            </div>
            <div class="form-group">
              <label htmlFor="volume">Volume</label>
              <input type="number" class="form-control" name="" id="volume" value="40" min="40" max="100" onInput={e => this.volumeOfSphere = (e.target as HTMLInputElement).value} />
            </div>
            <button type="button" class="btn btn-primary" onClick={() => this.onSubmit() }>submit</button>
            <button type="button" class="btn btn-warning" onClick={() => this.reset() }>refresh</button>
          </div>
          <div class="col-md-6">
            <div class="svg-frame">
              <div class="water-displaced"><span>{ (parseFloat(this.volumeOfSphere) * parseFloat(this.densityOfSolid)).toFixed(2) }</span></div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 861.2">
                <defs>
                  <filter id="luminosity-noclip" x="329.22" y="-8567.87" width="294.16" height="32766" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask" x="329.22" y="-8567.87" width="294.16" height="32766" maskUnits="userSpaceOnUse">
                    <g class="cls-91" />
                  </mask>
                  <radialGradient id="radial-gradient" cx="1228.63" cy="604.3" r="272.72"
                    gradientTransform="matrix(-1.01, 0, 0, 1, 1702.71, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.3" />
                    <stop offset="0.65" />
                    <stop offset="0.71" stop-color="#232323" />
                    <stop offset="0.83" stop-color="#7e7e7e" />
                    <stop offset="1" stop-color="#fff" />
                  </radialGradient>
                  <filter id="luminosity-noclip-2" x="752.21" y="-8567.87" width="38.91" height="32766" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-2" x="752.21" y="-8567.87" width="38.91" height="32766" maskUnits="userSpaceOnUse">
                    <g class="cls-90" />
                  </mask>
                  <linearGradient id="linear-gradient" x1="897.58" y1="778.16" x2="897.58" y2="665.61"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0" />
                    <stop offset="0.36" stop-color="#666" />
                    <stop offset="0.67" stop-color="#b8b8b8" />
                    <stop offset="0.89" stop-color="#ebebeb" />
                    <stop offset="1" stop-color="#fff" />
                  </linearGradient>
                  <filter id="luminosity-noclip-3" x="709.49" y="-8567.87" width="153.06" height="32766" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-3" x="709.49" y="-8567.87" width="153.06" height="32766" maskUnits="userSpaceOnUse">
                    <g class="cls-89" />
                  </mask>
                  <radialGradient id="radial-gradient-2" cx="914.43" cy="663.46" r="141.91" xlinkHref="#radial-gradient" />
                  <linearGradient id="linear-gradient-2" x1="883.22" y1="688.54" x2="883.22" y2="776.47"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.3" />
                    <stop offset="0.86" />
                    <stop offset="0.88" stop-color="#232323" />
                    <stop offset="0.93" stop-color="#7e7e7e" />
                    <stop offset="1" stop-color="#fff" />
                  </linearGradient>
                  <filter id="luminosity-noclip-5" x="819.86" y="-8567.87" width="51.13" height="32766" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-5" x="819.86" y="-8567.87" width="51.13" height="32766" maskUnits="userSpaceOnUse">
                    <g class="cls-88" />
                  </mask>
                  <linearGradient id="linear-gradient-3" x1="833.39" y1="688.27" x2="798.23" y2="688.27"
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
                  <linearGradient id="linear-gradient-4" x1="833.39" y1="688.27" x2="798.23" y2="688.27"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.31" stop-color="#5b5b5b" />
                    <stop offset="0.36" stop-color="#7a7a7a" />
                    <stop offset="0.46" stop-color="#a9a9a9" />
                    <stop offset="0.56" stop-color="#cecece" />
                    <stop offset="0.64" stop-color="#e9e9e9" />
                    <stop offset="0.72" stop-color="#f9f9f9" />
                    <stop offset="0.78" stop-color="#fff" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-5" x1="1192.94" y1="652.51" x2="1192.94" y2="821.49"
                    xlinkHref="#linear-gradient-2" />
                  <filter id="luminosity-noclip-8" x="704.07" y="-8567.87" width="47.48" height="32766" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-8" x="704.07" y="-8567.87" width="47.48" height="32766" maskUnits="userSpaceOnUse">
                    <g class="cls-87" />
                  </mask>
                  <linearGradient id="linear-gradient-6" x1="929.23" y1="687.15" x2="964.71" y2="687.15"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.23" />
                    <stop offset="0.31" stop-color="#111" />
                    <stop offset="0.46" stop-color="#3c3c3c" />
                    <stop offset="0.67" stop-color="#838383" />
                    <stop offset="0.93" stop-color="#e3e3e3" />
                    <stop offset="1" stop-color="#fff" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-7" x1="929.23" y1="687.15" x2="964.71" y2="687.15"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0" />
                    <stop offset="0.1" stop-color="#111" />
                    <stop offset="0.29" stop-color="#3c3c3c" />
                    <stop offset="0.57" stop-color="#838383" />
                    <stop offset="0.91" stop-color="#e3e3e3" />
                    <stop offset="1" stop-color="#fff" />
                  </linearGradient>
                  <filter id="luminosity-noclip-10" x="701.51" y="-8567.87" width="170.21" height="32766" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-10" x="701.51" y="-8567.87" width="170.21" height="32766" maskUnits="userSpaceOnUse">
                    <g class="cls-86" />
                  </mask>
                  <linearGradient id="linear-gradient-8" x1="882.62" y1="604.54" x2="882.62" y2="595.82"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.63" />
                    <stop offset="0.73" stop-color="#4c4c4c" />
                    <stop offset="0.86" stop-color="#acacac" />
                    <stop offset="0.96" stop-color="#e8e8e8" />
                    <stop offset="1" stop-color="#fff" />
                  </linearGradient>
                  <filter id="luminosity-noclip-11" x="701.5" y="-8567.87" width="169.6" height="32766" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-11" x="701.5" y="-8567.87" width="169.6" height="32766" maskUnits="userSpaceOnUse">
                    <g class="cls-85" />
                  </mask>
                  <linearGradient id="linear-gradient-9" x1="882.93" y1="593.83" x2="882.93" y2="607.47"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.15" />
                    <stop offset="0.91" stop-color="#fff" />
                  </linearGradient>
                  <filter id="luminosity-noclip-12" x="313.89" y="-8567.87" width="327.11" height="32766" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-12" x="313.89" y="-8567.87" width="327.11" height="32766" maskUnits="userSpaceOnUse">
                    <g class="cls-84" />
                  </mask>
                  <linearGradient id="linear-gradient-10" x1="1191.79" y1="392.78" x2="1191.79" y2="376.01"
                    xlinkHref="#linear-gradient-8" />
                  <filter id="luminosity-noclip-13" x="313.87" y="-8567.87" width="325.95" height="32766" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-13" x="313.87" y="-8567.87" width="325.95" height="32766" maskUnits="userSpaceOnUse">
                    <g class="cls-83" />
                  </mask>
                  <linearGradient id="linear-gradient-11" x1="1192.39" y1="372.2" x2="1192.39" y2="398.41"
                    xlinkHref="#linear-gradient-9" />
                  <linearGradient id="linear-gradient-12" x1="897.58" y1="778.16" x2="897.58" y2="665.61"
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
                      d="M623.54,392l9,.6L640,395.2l-.23,5.45s-8.81.12-12.17,3.67a14,14,0,0,0-4.09,9V785.19c0,21.3-18.4,38.58-39.62,38.58H367.8a38.5,38.5,0,0,1-38.42-38.58V411.65a16.54,16.54,0,0,0-3-9.4c-3-4.23-6-4-6-4v-5.72l9-.57Z" />
                  </clipPath>
                  <linearGradient id="linear-gradient-13" x1="641.21" y1="607.67" x2="313.64" y2="607.67"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#00d9e9" />
                    <stop offset="0.02" stop-color="#00d3e3" />
                    <stop offset="0.09" stop-color="#00c4d3" />
                    <stop offset="0.16" stop-color="#00bcca" />
                    <stop offset="0.27" stop-color="#00b9c7" />
                    <stop offset="0.36" stop-color="#1dbfce" />
                    <stop offset="0.55" stop-color="#68cfde" />
                    <stop offset="0.67" stop-color="#98d9e9" />
                    <stop offset="0.71" stop-color="#8ed9e9" />
                    <stop offset="0.77" stop-color="#74d9e9" />
                    <stop offset="0.86" stop-color="#49d9e9" />
                    <stop offset="0.96" stop-color="#0ed9e9" />
                    <stop offset="0.98" stop-color="#00d9e9" />
                  </linearGradient>
                  <clipPath id="clip-path-2">
                    <path class="cls-26"
                      d="M862.52,604.45s2.74,0,3.64.12a19.12,19.12,0,0,1,4.71,1.27,12,12,0,0,0-6.1,1.79c-2.76,1.77-2.25,5.44-2.25,5.44v89.51c0,11.08-9.57,20.07-20.61,20.07H729.46a20,20,0,0,1-20-20.07V613a10.7,10.7,0,0,0-2-7c-.57-.78-2.88-1.59-2.88-1.59l4.85.08Z" />
                  </clipPath>
                  <linearGradient id="linear-gradient-14" x1="870.87" y1="663.84" x2="702.58" y2="663.84"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#00d9e9" />
                    <stop offset="0.02" stop-color="#00d3e3" />
                    <stop offset="0.09" stop-color="#00c4d3" />
                    <stop offset="0.16" stop-color="#00bcca" />
                    <stop offset="0.27" stop-color="#00b9c7" />
                    <stop offset="0.41" stop-color="#31c3d2" stop-opacity="0.87" />
                    <stop offset="0.67" stop-color="#98d9e9" stop-opacity="0.6" />
                    <stop offset="0.72" stop-color="#88d9e9" stop-opacity="0.64" />
                    <stop offset="0.82" stop-color="#5dd9e9" stop-opacity="0.76" />
                    <stop offset="0.94" stop-color="#17d9e9" stop-opacity="0.94" />
                    <stop offset="0.98" stop-color="#00d9e9" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-15" x1="523.69" y1="252.14" x2="443.69" y2="252.14"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0.19" stop-color="#e12617" />
                    <stop offset="0.4" stop-color="#eb4630" />
                    <stop offset="0.89" stop-color="#ef634d" />
                    <stop offset="0.94" stop-color="#ef6751" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-16" x1="523.69" y1="252.14" x2="443.69" y2="252.14"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0.19" stop-color="#4f4f4f" />
                    <stop offset="0.4" stop-color="#333" />
                    <stop offset="0.6" stop-color="#505050" />
                    <stop offset="0.94" stop-color="#8c8c8c" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-17" x1="523.69" y1="252.14" x2="443.69" y2="252.14"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0.19" stop-color="#3fb6ff" />
                    <stop offset="0.4" stop-color="#3599d6" />
                    <stop offset="0.58" stop-color="#52abe1" />
                    <stop offset="0.94" stop-color="#97d6fc" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-18" x1="523.69" y1="252.14" x2="443.69" y2="252.14"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0.19" stop-color="#7f5100" />
                    <stop offset="0.4" stop-color="#ab7c27" />
                    <stop offset="0.78" stop-color="#c8850c" />
                    <stop offset="0.94" stop-color="#d68900" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-19" x1="523.69" y1="252.14" x2="443.69" y2="252.14"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0.19" stop-color="#858585" />
                    <stop offset="0.4" stop-color="#9e9e9e" />
                    <stop offset="0.94" stop-color="#adadad" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-20" x1="523.69" y1="252.14" x2="443.69" y2="252.14"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0.19" stop-color="#d4b100" />
                    <stop offset="0.4" stop-color="#ffd500" />
                    <stop offset="0.63" stop-color="#eecc1d" />
                    <stop offset="0.94" stop-color="#d4be4c" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-21" x1="746.64" y1="607.55" x2="320.17" y2="607.55"
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
                  <filter id="luminosity-noclip-15" x="329.22" y="675.32" width="294.16" height="148.45" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-15" x="329.22" y="675.32" width="294.16" height="148.45" maskUnits="userSpaceOnUse">
                    <g class="cls-1">
                      <path class="cls-2"
                        d="M623.38,675.32V785.19c0,21.3-18.4,38.58-39.62,38.58H367.64a38.5,38.5,0,0,1-38.42-38.58V675.32Z" />
                    </g>
                  </mask>
                  <radialGradient id="radial-gradient-3" cx="1228.63" cy="604.3" r="272.72"
                    gradientTransform="matrix(-1.01, 0, 0, 1, 1702.71, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.3" stop-color="#fff" />
                    <stop offset="0.65" stop-color="#fff" />
                    <stop offset="0.76" stop-color="#dcdcdc" />
                    <stop offset="1" stop-color="#858585" />
                  </radialGradient>
                  <filter id="luminosity-noclip-16" x="329.22" y="645.46" width="294.16" height="177.9" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-16" x="329.22" y="645.46" width="294.16" height="177.9" maskUnits="userSpaceOnUse">
                    <g class="cls-12">
                      <path class="cls-13"
                        d="M623.38,645.46V784.78c0,21.3-18.4,38.58-39.62,38.58H367.64a38.5,38.5,0,0,1-38.42-38.58V653.59C447.34,653.59,574.11,649.84,623.38,645.46Z" />
                    </g>
                  </mask>
                  <linearGradient id="linear-gradient-22" x1="1192.94" y1="652.51" x2="1192.94" y2="821.49"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.3" stop-color="#fff" />
                    <stop offset="0.86" stop-color="#fff" />
                    <stop offset="0.9" stop-color="#dcdcdc" />
                    <stop offset="1" stop-color="#858585" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-23" x1="1037.62" y1="402.25" x2="1338.52" y2="402.25"
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
                  <linearGradient id="linear-gradient-24" x1="1190.31" y1="375.24" x2="1190.31" y2="396.18"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.37" stop-color="#f2f2f2" />
                    <stop offset="1" stop-color="#b8b8b8" />
                  </linearGradient>
                  <filter id="luminosity-noclip-17" x="313.89" y="377.53" width="327.11" height="4.95" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-17" x="313.89" y="377.53" width="327.11" height="4.95" maskUnits="userSpaceOnUse">
                    <g class="cls-21">
                      <path class="cls-22" d="M313.89,382.48a7.61,7.61,0,0,1,7.14-5h301.7c12.26,0,14.9,2.12,18.28,5Z" />
                    </g>
                  </mask>
                  <linearGradient id="linear-gradient-25" x1="1191.79" y1="392.78" x2="1191.79" y2="376.01"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.63" stop-color="#fff" />
                    <stop offset="0.78" stop-color="#c1c1c1" />
                    <stop offset="0.93" stop-color="#858585" />
                    <stop offset="1" stop-color="#6e6e6e" />
                  </linearGradient>
                  <filter id="luminosity-noclip-18" x="313.87" y="387.52" width="325.95" height="7.75" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-18" x="313.87" y="387.52" width="325.95" height="7.75" maskUnits="userSpaceOnUse">
                    <g class="cls-23">
                      <path class="cls-24"
                        d="M317.28,388.53H629.33c6,0,8,1.41,9.26,3.14.21.3,2.42,3.6.36,3.6-4.41,0,.3-2.73-21.83-2.73H321a7.58,7.58,0,0,1-7.16-5h.33A4.86,4.86,0,0,0,317.28,388.53Z" />
                    </g>
                  </mask>
                  <linearGradient id="linear-gradient-26" x1="1192.39" y1="372.2" x2="1192.39" y2="398.41"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.15" stop-color="#fff" />
                    <stop offset="0.91" stop-color="#6e6e6e" />
                  </linearGradient>
                  <linearGradient id="linear-gradient-27" x1="802.4" y1="662.08" x2="958.97" y2="662.08"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" xlinkHref="#linear-gradient-21" />
                  <mask id="mask-19" x="752.21" y="643.23" width="38.91" height="121.48" maskUnits="userSpaceOnUse">
                    <g class="cls-3">
                      <path class="cls-25" d="M790.58,643.23c.81,119.14,3.55,121.48-19.6,121.48-22.26,0-19,.73-18.08-121.48Z" />
                    </g>
                  </mask>
                  <filter id="luminosity-noclip-19" x="752.21" y="643.23" width="38.91" height="121.48" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <linearGradient id="linear-gradient-28" x1="897.58" y1="731.46" x2="897.58" y2="657.86"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#f6f6f5" />
                    <stop offset="1" stop-color="#fff" />
                  </linearGradient>
                  <filter id="luminosity-noclip-20" x="709.49" y="700.41" width="153.06" height="77.24" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-21" x="709.49" y="700.41" width="153.06" height="77.24" maskUnits="userSpaceOnUse">
                    <g class="cls-5">
                      <path class="cls-6"
                        d="M862.55,700.41v57.17c0,11.08-9.57,20.07-20.61,20.07H729.48a20,20,0,0,1-20-20.07V700.41Z" />
                    </g>
                  </mask>
                  <radialGradient id="radial-gradient-4" cx="914.43" cy="689.52" r="80.11" xlinkHref="#radial-gradient-3" />
                  <filter id="luminosity-noclip-21" x="709.49" y="684.87" width="153.06" height="92.57" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-22" x="709.49" y="684.87" width="153.06" height="92.57" maskUnits="userSpaceOnUse">
                    <g class="cls-7">
                      <path class="cls-8"
                        d="M862.55,684.87v72.49c0,11.09-9.57,20.08-20.61,20.08H729.48a20,20,0,0,1-20-20.08V689.11C771,689.11,836.91,687.15,862.55,684.87Z" />
                    </g>
                  </mask>
                  <linearGradient id="linear-gradient-29" x1="883.22" y1="686.38" x2="883.22" y2="722.55"
                    xlinkHref="#linear-gradient-22" />
                  <linearGradient id="linear-gradient-30" x1="802.4" y1="606.63" x2="958.97" y2="606.63"
                    xlinkHref="#linear-gradient-23" />
                  <mask id="mask-23" x="819.86" y="601.84" width="51.13" height="172.85" maskUnits="userSpaceOnUse">
                    <g class="cls-9">
                      <path class="cls-10"
                        d="M837.45,742.77c0-38.23.09-118.7.13-140.93h25s6.91,2.44,8.42,3.51a2.43,2.43,0,0,0,0,.47l-.12,0c-9,.54-8.32,6.44-8.32,6.44v128.1c0,40.7-20.79,33.88-42.06,33.88C816,774.26,837.45,770.39,837.45,742.77Z" />
                    </g>
                  </mask>
                  <filter id="luminosity-noclip-22" x="819.86" y="601.84" width="51.13" height="172.85" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <linearGradient id="linear-gradient-31" x1="833.39" y1="661.02" x2="798.23" y2="661.02"
                    gradientTransform="matrix(-1, 0, 0, 1, 1669.24, 0)" gradientUnits="userSpaceOnUse">
                    <stop offset="0.31" stop-color="#f7f7f6" />
                    <stop offset="0.42" stop-color="#fafaf9" />
                    <stop offset="0.78" stop-color="#fff" />
                  </linearGradient>
                  <mask id="mask-25" x="704.07" y="600.73" width="47.48" height="172.85" maskUnits="userSpaceOnUse">
                    <g class="cls-14">
                      <path class="cls-15"
                        d="M734,741.65c0-38.22-.1-118.69-.13-140.92H709.49s-7.75,2.53-4.71,3.71a7.58,7.58,0,0,1,4.71,6.74V739.26c0,40.71,20.16,33.89,41.44,33.89C755.47,773.15,734,769.28,734,741.65Z" />
                    </g>
                  </mask>
                  <filter id="luminosity-noclip-23" x="704.07" y="600.73" width="47.48" height="172.85" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <linearGradient id="linear-gradient-32" x1="929.23" y1="659.91" x2="964.71" y2="659.91"
                    xlinkHref="#linear-gradient-28" />
                  <linearGradient id="linear-gradient-33" x1="881.85" y1="595.41" x2="881.85" y2="606.31"
                    xlinkHref="#linear-gradient-24" />
                  <filter id="luminosity-noclip-24" x="701.51" y="596.6" width="170.21" height="2.58" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-27" x="701.51" y="596.6" width="170.21" height="2.58" maskUnits="userSpaceOnUse">
                    <g class="cls-17">
                      <path class="cls-18" d="M701.51,599.18a4,4,0,0,1,3.72-2.58h157c6.38,0,7.75,1.11,9.51,2.58Z" />
                    </g>
                  </mask>
                  <linearGradient id="linear-gradient-34" x1="882.62" y1="604.54" x2="882.62" y2="595.82"
                    xlinkHref="#linear-gradient-25" />
                  <filter id="luminosity-noclip-25" x="701.5" y="601.8" width="169.6" height="4.03" filterUnits="userSpaceOnUse"
                    color-interpolation-filters="s-rGB">
                    <feFlood flood-color="#fff" result="bg" />
                    <feBlend in="SourceGraphic" in2="bg" />
                  </filter>
                  <mask id="mask-28" x="701.5" y="601.8" width="169.6" height="4.03" maskUnits="userSpaceOnUse">
                    <g class="cls-19">
                      <path class="cls-20"
                        d="M703.28,602.33H865.64c3.15,0,4.19.73,4.82,1.63.11.16,1.26,1.88.19,1.88-2.29,0,.16-1.43-11.35-1.43H705.23a3.94,3.94,0,0,1-3.73-2.6h.17A2.49,2.49,0,0,0,703.28,602.33Z" />
                    </g>
                  </mask>
                  <linearGradient id="linear-gradient-35" x1="882.93" y1="593.83" x2="882.93" y2="607.47"
                    xlinkHref="#linear-gradient-26" />
                  <linearGradient id="linear-gradient-36" x1="623.25" y1="540.5" x2="741.04" y2="540.5"
                    xlinkHref="#linear-gradient-14" />
                </defs>
                <g class="cls-27">
                  <g id="Layer_0" data-name="Layer 0">
                    <g id="Your_Own_Solid" data-name="Your Own Solid">
                      <circle ref={el => this.ballRef = el as SVGElement} fill={solidColor} class="cls-33" cx="483.69" cy="252.14" r="40" />
                    </g>
                    <g id="Color_5" data-name="Color 5">
                      <g class="cls-28">
                        {/* <rect class="cls-29" x="313.64" y="509" width="327.57" height="431.38" /> */}
                        <rect fill={liquidColor} class="cls- opacity-liquid" x="313.64" y="509" width="327.57" height="431.38" />
                      </g>
                    </g>
                    <g id="Color_5-2" data-name="Color 5">
                      <g class="cls-30">
                        {/* <rect ref={el => this.smallBeaker = el as SVGElement} fill={liquidColor} class="cls-31" x="702.58" y="722" width="168.29" height="120.03" /> */}
                        <rect ref={el => this.smallBeaker = el as SVGElement} fill={liquidColor} class="cls- opacity-liquid" x="702.58" y="722" width="168.29" height="120.03" />
                      </g>
                    </g>
                    <g id="Layer_6" data-name="Layer 6">
                      <path class="cls-32"
                        d="M495.45,198.08a4.6,4.6,0,0,0-4.22-2.75,4.26,4.26,0,0,0-.61,0,4.68,4.68,0,0,0-3.88,3.22L485,204V0h-2.35V206.77l-4.41-6.15a4.72,4.72,0,0,0-4.69-1.87l-.35.08,0,0a4.67,4.67,0,0,0-1.16,8.5l8.37,5c.66-.05,1.32-.09,2-.12h.1l1.14,0h.2l1.3,0,0,0,0,0c.49,0,1,0,1.47.08h0l8.08-9.25A4.61,4.61,0,0,0,495.45,198.08Zm-22.21,7.25a2.31,2.31,0,0,1,.74-4.25l.15,0a2.33,2.33,0,0,1,2.19,1l6.33,8.81v0h0l.11.15,0,0Zm19.7-3.79L485.58,210,489,199.3a2.33,2.33,0,0,1,1.94-1.59l.31,0a2.33,2.33,0,0,1,1.71,3.85Z" />
                    </g>

                    {/* <g id="Lead">
                      <circle class="cls-34" cx="483.69" cy="252.14" r="40" />
                    </g>
                    <g id="SilverLead">
                      <circle class="cls-35" cx="483.69" cy="252.14" r="40" />
                    </g>
                    <g id="Copper">
                      <circle class="cls-36" cx="483.69" cy="252.14" r="40" />
                    </g>
                    <g id="Aluminum">
                      <circle class="cls-37" cx="483.69" cy="252.14" r="40" />
                    </g>
                    <g id="Birchwood">
                      <circle class="cls-38" cx="483.69" cy="252.14" r="40" />
                    </g> */}
                    <g id="Layer_4" data-name="Layer 4">
                      <path class="cls-39"
                        d="M611.33,89.47c-2.3-6.79-38.65-.68-77.48-7.92l-.05,0c-5.17-1.49-88-31.07-113.7-26L529.45,91.25l0,0c3.85,1,18.49,3.32,22.35,3.92,3.94,9.33,4.63,13.5,14,16.15s25.57,5,33.72-2.51C603.74,104.93,612.58,93.17,611.33,89.47Zm-8.67,6.14c-2.71,4.32-7.33,11.56-12.85,12.56s-22.4-.4-25.72-2.91-5.63-8.74-4.72-11.05,5.22-2.92,7.53-3.12c4.21-.36,29.64-.1,31.85.51S605.38,91.29,602.66,95.61Z" />
                      <path class="cls-40" d="M525.05,75.56,503,77.85l-84.7,10.5,2.54,2.6c33.07,2.9,71.41,1.24,108.7.49l2.89-6.81Z" />
                      <path class="cls-41" d="M418.25,88.35l1.89,1.93q38.72,0,82-3.13l.72-9.27Z" />
                      <path class="cls-42"
                        d="M586.58,41.07c-6.65-6.94-15.05-7.32-23.92-4-7.35,2.73-15.95,11.66-9.92,26-7.94,3.61-16.21,7.3-27.63,12.55,0,0,5,6.43,7.27,9,7.9-4.08,21.36-9.71,34.52-15.14,13.46-5.62,21.81-12.73,23-17.8S589.23,43.84,586.58,41.07Zm-9.33,16.57c-3.52,2.51-10,6.93-14.26,5.93s-6.74-5-6.53-9.34c-.61-7.74,8-13.87,15.77-14.17s10.57,4,12.08,7.92S580.77,55.13,577.25,57.64Z" />
                      <path class="cls-43" d="M519.75,79a4.71,4.71,0,1,1-5.42,4,4.76,4.76,0,0,1,5.42-4Z" />
                      <path class="cls-44"
                        d="M519.75,79a5,5,0,0,1,.58.12L519,88.33a3.92,3.92,0,0,1-.59,0,3.71,3.71,0,0,1-.58-.11l1.32-9.26a5.87,5.87,0,0,1,.59,0Z" />
                    </g>
                    <g id="Layer_3" data-name="Layer 3">
                      <path class="cls-45"
                        d="M711.54,746.11s107.09-6.34,137.81,11.82c4.32,2.55,5.13,36.85.45,40.54-15.56,12.26-70.28,9.24-70.28,9.24l-89.3,3.6,4.42,1.25H878.09s6.86,1.33,7-5.34S865,746.34,865,746.34s-4.25-2.12-11.78-2.12h-139Z" />
                      <path
                        d="M711.35,814.57c-.41,1.41-.8,2.54-1.06,3.69-.7,3.16-2,5.21-5.86,5.1-3.6-.11-4.93-1.89-5.44-5-.38-2.36-1.23-3.79-4.3-3.91-6.21-.24-10.1-6.36-7.92-12.41,6.46-18,13.11-35.9,19.8-53.79a7.24,7.24,0,0,1,7.42-5c5.3.06,60.59,0,66.13,0V733.07c-7.75,0-63.33.07-71,0a12.57,12.57,0,0,1-12.46-10.29c-.66-3.27.25-5.86,3.57-7.07,2.68-1,4.88.93,6.4,4.36.58,1.31,2.49,2.88,3.81,2.89,18.63.19,133.07.12,151.69.15,2.38,0,3.67-.88,4.1-3.32.55-3.1,2.67-4.74,5.73-4.13s4.48,3.06,4.13,6.29a12.61,12.61,0,0,1-12.55,11.12c-7.57.1-63.06,0-71,0v10.18c5.28,0,60.44.07,65.6,0,4.17-.08,6.76,1.89,8.15,5.68,6.42,17.43,12.88,34.84,19.22,52.3,2.57,7.06-1,12.87-8.36,13.26-3.28.17-3.17,2.38-3.57,4.22-.72,3.25-2.33,4.72-5.79,4.66-3.1-.06-4.89-1.35-5.17-4.29-.37-4-2.58-4.61-6.16-4.57C841.6,814.68,726.7,814.57,711.35,814.57Zm75-2.13c12.89,0,75.78,0,88.68,0,7.66,0,10.68-4.26,8.1-11.34-6.19-16.93-12.48-33.82-18.63-50.77-1.34-3.7-3.74-5.12-7.54-5.09-13.69.08-127.38.1-141.07,0-4.18,0-6.55,1.59-8,5.6-6,16.59-11.89,33.2-18.38,49.59-3,7.46,1.31,12.37,8.55,12.14C710.84,812.16,773.61,812.44,786.37,812.44Zm-.46-81.64c9.84,0,67.59.07,77.44,0,5.73-.07,10.23-4,10.28-9,0-1.29-1.43-2.6-2.21-3.9-1.06.93-2.8,1.71-3.06,2.83-.78,3.41-2.76,4.5-6,4.49-18.76,0-133.34-.05-152.1,0-3.23,0-5.22-1.06-6-4.46-.27-1.13-2-1.92-3-2.86-.78,1.3-2.24,2.61-2.23,3.9,0,5,4.57,8.93,10.28,9C718.84,730.88,776.33,730.8,785.91,730.8Zm3.72,12.31v-9.69h-6.57v9.69Zm-89.14,71.67c1,2.48-.43,5.84,3.72,6.14,4.76.35,3.38-3.57,4.64-6.14Zm162.73,0c1.95,2.73.58,6.94,5.4,6.17,3.79-.61,2.73-3.64,3.29-6.17Z" />
                      <path
                        d="M840.42,801.65H731.33a13,13,0,0,1-13-13V768.23a13,13,0,0,1,13-13H840.42a13,13,0,0,1,13,13v20.42A13,13,0,0,1,840.42,801.65ZM731.33,757.23a11,11,0,0,0-11,11v20.42a11,11,0,0,0,11,11H840.42a11,11,0,0,0,11-11V768.23a11,11,0,0,0-11-11Z" />
                      <line class="cls-46" x1="689.65" y1="808.87" x2="884.15" y2="808.87" />
                      <line class="cls-47" x1="711.22" y1="751.37" x2="707.65" y2="761.09" />
                      <line class="cls-48" x1="865.22" y1="762.49" x2="874.93" y2="789.33" />
                      <line class="cls-48" x1="867.57" y1="779.51" x2="871.5" y2="790.12" />
                    </g>
                    <g id="Layer_2" data-name="Layer 2">
                      <path class="cls-49"
                        d="M746.64,572.23l-7.48,7L623.33,509V785.19c0,21.3-18.4,38.58-39.62,38.58H367.59a38.5,38.5,0,0,1-38.42-38.58v-374c-.92-11.21-9-13-9-13v-5.72L331,392.5c.09-.29.19-.56.29-.85H621.19c.1.29,12.82-.54,12.91-.25l5.72,3.8v3.32a6,6,0,0,0-.23,2.45c-1.94,0-16.26.71-16.26,12.39v43.39Z" />
                      <g class="cls-50">
                        <path class="cls-51"
                          d="M623.38,675.32V785.19c0,21.3-18.4,38.58-39.62,38.58H367.64a38.5,38.5,0,0,1-38.42-38.58V675.32Z" />
                      </g>
                      <g class="cls-52">
                        <path class="cls-53"
                          d="M623.38,645.46V784.78c0,21.3-18.4,38.58-39.62,38.58H367.64a38.5,38.5,0,0,1-38.42-38.58V653.59C447.34,653.59,574.11,649.84,623.38,645.46Z" />
                      </g>
                      <g class="cls-54">
                        <path class="cls-55"
                          d="M331,392.25c.09-.29.2-.56.29-.85H621.19c.1.29,11.59.29,11.68.58l7,3-.16,3.95a6.05,6.05,0,0,0-.07,1.75v0s-16.31-.27-16.26,12.43c0,0-11.59-12.7-147.7-12.7C331.79,400.41,329.17,411,329.17,411c-.92-11.21-9-13-9-13V392.3Z" />
                      </g>
                      <path class="cls-56"
                        d="M313.43,385a7.56,7.56,0,0,0,7.6,7.51H617.12c22.13,0,17.23,2.73,21.83,2.73,9.68,0,7.07-17.74-12.19-17.74H321a7.56,7.56,0,0,0-7.6,7.5Z" />
                      <g class="cls-57">
                        <path class="cls-58" d="M313.89,382.48a7.61,7.61,0,0,1,7.14-5h301.7c12.26,0,14.9,2.12,18.28,5Z" />
                      </g>
                      <g class="cls-59">
                        <path class="cls-60"
                          d="M317.28,388.53H629.33c6,0,8,1.41,9.26,3.14.21.3,2.42,3.6.36,3.6-4.41,0,.3-2.73-21.83-2.73H321a7.58,7.58,0,0,1-7.16-5h.33A4.86,4.86,0,0,0,317.28,388.53Z" />
                      </g>
                      <g class="cls-61">
                        <path class="cls-62"
                          d="M328.53,381.69l3.59.25,10.18.67c4.37.27,9.7.58,15.8.89,3,.16,6.3.36,9.72.5,1.71.08,3.46,0,5.26,0l5.51,0,110.13-.31,58.82-.17,27.06-.07c8.6,0,16.74-.11,24.24,0,1.88,0,3.72-.15,5.52-.25l5.26-.31,9.71-.58c3-.18,5.93-.42,8.52-.52a32.13,32.13,0,0,1,7.06.61,13.08,13.08,0,0,1,5.18,2.15,5.91,5.91,0,0,1,2.26,3.4,7.47,7.47,0,0,1,.09,2.62,8.61,8.61,0,0,1-.16.91,7.55,7.55,0,0,0,.24-.9,7.43,7.43,0,0,0,.13-2.69,6.39,6.39,0,0,0-2.13-3.85,13.68,13.68,0,0,0-5.32-2.78,32.5,32.5,0,0,0-7.31-1.22c-2.68-.08-5.5-.31-8.57-.47l-9.71-.53-5.27-.27c-1.79-.09-3.63-.24-5.51-.22-7.51.13-15.64.07-24.25.12l-27.06.08-58.82.17-110.12.31h-5.51c-1.8,0-3.55-.08-5.27,0-3.42.17-6.66.38-9.72.56-6.09.34-11.41.69-15.79,1s-7.82.55-10.17.72Z" />
                      </g>
                      <path class="cls-63"
                        d="M710.42,601.43c.05-.15.11-.29.16-.44H861.41c.05.15.11.29.15.44l9.55,1.41v1.72a2.92,2.92,0,0,0-.12,1.28c-1,0-8.47.37-8.47,6.44v90.81c0,11.09-9.57,20.08-20.61,20.08H729.46a20,20,0,0,1-20-20.08V611.18c-.48-5.83-4.68-6.74-4.68-6.74v-3Z" />
                      <g class="cls-64">
                        <g class="cls-64">
                          <path class="cls-65" d="M790.58,643.23c.81,119.14,3.55,67-19.6,67-22.26,0-19,55.21-18.08-67Z" />
                        </g>
                      </g>
                      <path class="cls-66" d="M790.44,610.15c0,11,.06,22.16.11,31H752.94c0-8.83.1-20,.12-31Z" />
                      <rect class="cls-67" x="779.6" y="610.15" width="5.89" height="30.99" />
                      <path class="cls-62" d="M778.61,644.11h7.06V695c0,5.06-7.06,3.11-7.06-9.28Z" />
                      <g class="cls-68">
                        <path class="cls-69"
                          d="M862.55,700.41v2.68c0,11.09-9.57,20.08-20.61,20.08H729.48a20,20,0,0,1-20-20.08v-2.68Z" />
                      </g>
                      <g class="cls-70">
                        <path class="cls-71"
                          d="M862.55,684.87v18C862.55,714,853,723,841.94,723H729.48a20,20,0,0,1-20-20.07V689.11C771,689.11,836.91,687.15,862.55,684.87Z" />
                      </g>
                      <g class="cls-54">
                        <path class="cls-72"
                          d="M710.42,601.43c.05-.15.11-.29.16-.44H861.41c.05.15.11.29.15.44l9.55,1.41-.09,2a3.09,3.09,0,0,0,0,.91v0s-8.48-.14-8.46,6.46c0,0-6-6.6-76.85-6.6-74.84,0-76.21,5.5-76.21,5.5-.48-5.83-4.68-6.74-4.68-6.74v-3Z" />
                      </g>
                      <g class="cls-73">
                        <g class="cls-73">
                          <path class="cls-74"
                            d="M837.45,688.28c0-38.23.09-64.21.13-86.44h25s6.91,2.44,8.42,3.51a2.43,2.43,0,0,0,0,.47l-.12,0c-9,.54-8.32,6.44-8.32,6.44v73.61c0,40.7-20.79,33.88-42.06,33.88C816,719.77,837.45,715.91,837.45,688.28Z" />
                        </g>
                      </g>
                      <g class="cls-75">
                        <g class="cls-75">
                          <path class="cls-76"
                            d="M734,687.16c0-38.22-.1-64.2-.13-86.43H709.49s-7.75,2.53-4.71,3.71a7.58,7.58,0,0,1,4.71,6.74v73.6c0,40.7,20.16,33.88,41.44,33.88C755.47,718.66,734,714.79,734,687.16Z" />
                        </g>
                      </g>
                      <path class="cls-77"
                        d="M701.27,600.51a3.93,3.93,0,0,0,4,3.9H859.3c11.51,0,9,1.43,11.35,1.43,5,0,3.68-9.24-6.34-9.24H705.23a3.94,3.94,0,0,0-4,3.91Z" />
                      <g class="cls-78">
                        <path class="cls-79" d="M701.51,599.18a4,4,0,0,1,3.72-2.58h157c6.38,0,7.75,1.11,9.51,2.58Z" />
                      </g>
                      <g class="cls-80">
                        <path class="cls-81"
                          d="M703.28,602.33H865.64c3.15,0,4.19.73,4.82,1.63.11.16,1.26,1.88.19,1.88-2.29,0,.16-1.43-11.35-1.43H705.23a3.94,3.94,0,0,1-3.73-2.6h.17A2.49,2.49,0,0,0,703.28,602.33Z" />
                      </g>
                      <g class="cls-61">
                        <path class="cls-62"
                          d="M709.13,598.77l1.87.13,5.29.35c2.28.14,5.05.3,8.22.46,1.59.08,3.28.19,5.06.26.89,0,1.8,0,2.74,0h2.87l57.3-.16,30.61-.09,14.08,0c4.47,0,8.71,0,12.61,0,1,0,1.94-.07,2.87-.13l2.74-.16,5.05-.3c1.59-.09,3.09-.22,4.44-.27a17.39,17.39,0,0,1,3.67.31,6.85,6.85,0,0,1,2.69,1.13,3,3,0,0,1,1.18,1.76,3.86,3.86,0,0,1,.05,1.37,4.57,4.57,0,0,1-.08.47s.05-.15.12-.46a4.2,4.2,0,0,0,.07-1.41,3.34,3.34,0,0,0-1.11-2,7.13,7.13,0,0,0-2.77-1.45,17.52,17.52,0,0,0-3.8-.63c-1.4,0-2.87-.16-4.46-.24l-5.06-.28-2.74-.14c-.93-.05-1.88-.12-2.86-.12-3.91.07-8.14,0-12.62.07l-14.08,0-30.61.09-57.3.16h-2.86c-.94,0-1.85-.05-2.75,0-1.78.08-3.46.2-5,.29-3.17.17-5.94.36-8.22.51l-5.29.38Z" />
                      </g>
                    </g>
                    <path id="Water_Drops" data-name="Water Drops" class="cls-82"
                      d="M636.65,505.37a5,5,0,1,1-5.19,8.44l-.13-.09a4.8,4.8,0,0,1-1.37-1.36,110.72,110.72,0,0,1-6.71-9.42h0c6.83.3,10.49,1.27,12.19,1.89a4.83,4.83,0,0,1,1.15.5Zm22.86,15.23A4.32,4.32,0,0,1,655,528l-.12-.07a4.25,4.25,0,0,1-1.2-1.19,96.44,96.44,0,0,1-5.84-8.21h0c5.95.26,9.14,1.1,10.62,1.64a4.49,4.49,0,0,1,1,.44Zm26,16A4.32,4.32,0,1,1,681,544l-.11-.07a4.25,4.25,0,0,1-1.2-1.19,96.44,96.44,0,0,1-5.84-8.21h0c5.94.26,9.14,1.1,10.62,1.64a4.42,4.42,0,0,1,1,.44Zm37,24.71a3.3,3.3,0,0,1-3.46,5.63l-.09-.06a3.46,3.46,0,0,1-.92-.91,75.13,75.13,0,0,1-4.47-6.28h0a28.14,28.14,0,0,1,8.13,1.26,3.22,3.22,0,0,1,.76.34Zm-18-10.83a3.3,3.3,0,0,1-3.46,5.63l-.09-.06a3.29,3.29,0,0,1-.92-.9,74.17,74.17,0,0,1-4.46-6.28h0a28.26,28.26,0,0,1,8.12,1.25,3.48,3.48,0,0,1,.77.34Zm35.16,22.3a2.85,2.85,0,0,1-3,4.86l-.07,0a2.73,2.73,0,0,1-.78-.77,61.89,61.89,0,0,1-3.76-5.36h0a23.81,23.81,0,0,1,6.91,1,3.36,3.36,0,0,1,.65.28Z" />
                  </g>
                </g>
              </svg>
            </div>
            <p class="text-center">Water displaced value: <span>{ (parseFloat(this.volumeOfSphere) * parseFloat(this.densityOfSolid)).toFixed(2) }</span></p>
          </div>
        </div>
      </form>
    </div>
  }
}
