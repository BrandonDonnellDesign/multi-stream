import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {}

export const KickIcon = (props: IconProps) => (
  <svg
    {...props}
    viewBox='0 0 512 512'
    xmlns='http://www.w3.org/2000/svg'
    fillRule='evenodd'
    clipRule='evenodd'
    strokeLinejoin='round'
    strokeMiterlimit='2'>
    <path
      d='M37 .036h164.448v113.621h54.71v-56.82h54.731V.036h164.448v170.777h-54.73v56.82h-54.711v56.8h54.71v56.82h54.73V512.03H310.89v-56.82h-54.73v-56.8h-54.711v113.62H37V.036z'
      fill='#53fc18'
    />
  </svg>
);

export const TwitchIcon = (props: IconProps) => (
  <svg {...props}
    xmlns='http://www.w3.org/2000/svg'
    shapeRendering='geometricPrecision'
    textRendering='geometricPrecision'
    imageRendering='optimizeQuality'
    fillRule='evenodd'
    clipRule='evenodd'
    viewBox='0 0 439 512.17'>
    <g fillRule='nonzero'>
      <path
        fill='#FEFEFE'
        d='M402.42 237.79l-73.17 73.17h-73.17l-64.02 64.02v-64.02h-82.31V36.59h292.67z'
      />
      <path
        fill='#7E5AA1'
        d='M402.42 237.79l-73.17 73.17h-73.17l-64.02 64.02v-64.02h-82.31V36.59h292.67v201.2zM91.46 0L0 91.46v329.25h109.75v91.46l91.46-91.46h73.16L439 256.08V0H91.46z'
      />
      <path
        fill='#7E5AA1'
        d='M310.96 210.35h36.58V100.6h-36.58zM210.35 210.35h36.59V100.6h-36.59z'
      />
    </g>
  </svg>
);

export const YoutubeIcon = (props: IconProps) => (
  <svg {...props}
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 333333 333333'
    shape-rendering='geometricPrecision'
    text-rendering='geometricPrecision'
    image-rendering='optimizeQuality'
    fill-rule='evenodd'
    clip-rule='evenodd'>
    <path
      d='M329930 100020s-3254-22976-13269-33065c-12691-13269-26901-13354-33397-14124-46609-3396-116614-3396-116614-3396h-122s-69973 0-116608 3396c-6522 793-20712 848-33397 14124C6501 77044 3316 100020 3316 100020S-1 126982-1 154001v25265c0 26962 3315 53979 3315 53979s3254 22976 13207 33082c12685 13269 29356 12838 36798 14254 26685 2547 113354 3315 113354 3315s70065-124 116675-3457c6522-770 20706-848 33397-14124 10021-10089 13269-33090 13269-33090s3319-26962 3319-53979v-25263c-67-26962-3384-53979-3384-53979l-18 18-2-2zM132123 209917v-93681l90046 46997-90046 46684z'
      fill='red'
    />
  </svg>
);

const icons = { KickIcon, TwitchIcon, YoutubeIcon };

export default icons;
