
export interface ContactPerson {
  id: string;
  imieNazwisko: string;
  stanowisko: string;
  tel1: string;
  tel2: string;
  email: string;
}
export interface AlertInterface{
  message: string
  type: "error" | "success" | "warning"
}
export const mockUser: User = {
  id:"",
  nazwa:"",
  NIP:"",
  adres:"",
  phone:"",
  email:"",
  www:"",
  branza:[],
  segment:"",
  region:"",
  opis :"",
  listaOsobKontaktowych: [],
  dodatkoweInformacje: "",
  produkty: [],
  sprzedaz: "",
  zdjecie: [],
  tasks: []
}

export interface Task {
  id: string;
  data: string;
  zadanie: string;
  opis: string;
}
export interface subOptionsInterface{
  id: string;
  name: string;
  zuzycie:string;
  konkurencja:string;
}
export interface ProductOption {
  id: string;
  name: string;
  subOptions: subOptionsInterface[];
}

export interface User {
  id: string;
  nazwa: string;
  NIP: string;
  adres: string;
  phone: string;
  email: string;
  www: string;
  branza: string[];
  segment: string;
  region: string;
  opis: string;
  listaOsobKontaktowych: ContactPerson[];
  dodatkoweInformacje: string;
  produkty: ProductOption[];
  sprzedaz: string;
  zdjecie: string[]; // URL to uploaded image in Firebase Storage
  iv?:string;
  encryptedData?:string;
  tag?:string;
  lat?:number;
  lng?:number;
  tasks: Task[]
}


export interface EmployeeInterface {
  id: string
  name: string
  authMethod:"password"|"google";
  email: string
  veryfiedEmail:boolean
  products:ProductOption[]|[]
  phone: string
}

export interface Alert {
  id: string
  message: string
  type: 'error' | 'success' | 'warning'
}
export const getAlertStyles = (type: 'error' | 'success' | 'warning') => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-400'
      case 'warning':
        return 'bg-yellow-600 border-yellow-400'
      case 'error':
      default:
        return 'bg-red-600 border-red-400'
    }
  }
  export type TileLayerOptions = {
    attribution?: string;
    maxZoom?: number;
    minZoom?: number;
  };
  
  export type MapOptions = {
    zoom?: number;
    center?: [number, number];
    zoomControl?: boolean;
  };
  
  export type FitBoundsOptions = {
    padding?: [number, number];
    maxZoom?: number;
  };
  
  export type DivIconOptions = {
    className?: string;
    html?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
  };
  
  export type MarkerOptions = {
    icon?: LeafletIcon;
  };
  interface bounds{
    lat:number;
    lng:number;
  }
  export type LatLngBounds = {
    contains?: (point: [number, number]) => boolean;
    getSouthWest:()=>bounds;
    getNorthEast:()=>bounds;
    isValid:()=>boolean
  };
  
  export type TileLayer = {
    addTo: (map: LeafletMap) => TileLayer;
  };
  
  export type LeafletLib = {
    map: (container: HTMLElement | string, options?: MapOptions) => LeafletMap;
    marker: (latlng: [number, number], options?: MarkerOptions) => LeafletMarker;
    tileLayer: (urlTemplate: string, options?: TileLayerOptions) => TileLayer;
    divIcon: (options?: DivIconOptions) => LeafletIcon;
    latLngBounds: (latlngs: [number, number][]) => LatLngBounds;
    latLng: (lat: number, lng: number) => [number, number];
    featureGroup: (layers: LeafletMarker[]) => FeatureGroup;
  };
  
  declare global {
    interface Window {
      L: LeafletLib;
    }
  }
  
  export type LeafletMap = {
    remove: () => void;
    invalidateSize:()=>void
    setView: (center: [number, number], zoom: number) => LeafletMap;
    fitBounds: (bounds: LatLngBounds, options?: FitBoundsOptions) => void;
    addTo: (map: LeafletMap) => LeafletMap;
  };
  
  export type LeafletMarker = {
    remove: () => void;
    addTo: (map: LeafletMap) => LeafletMarker;
  
    bindPopup: (content: string) => LeafletMarker;
  
    bindTooltip: (
      content: string,
      options?: {
        permanent?: boolean;
        direction?: "top" | "bottom" | "left" | "right" | "center";
        offset?: [number, number];
        opacity?: number;
        interactive?: boolean;
        className?: string;
      }
    ) => LeafletMarker;
  
    on: (
      event: "click" | "mouseover" | "mouseout",
      handler: () => void
    ) => LeafletMarker;
  
    getLatLng: () => [number,number]
  };

  export type FeatureGroup = {
    getBounds: () => LatLngBounds;
  };
  
  export type LeafletIcon = {
    className?: string;
    html?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
  };
  
  export type Coordinates = {
    lat: number;
    lng: number;
  };
  
  export type GeminiPart = {
    text: string;
  };
  
  export type GeminiContent = {
    parts: GeminiPart[];
  };
  
  export type GeminiCandidate = {
    content?: GeminiContent;
  };
  
  export type GeminiResponse = {
    candidates?: GeminiCandidate[];
  };
  
  export interface Pin {
    id: number;
    address: string;
    lat: number;
    lng: number;
    title: string;
  }
  
  export interface NewPin {
    address: string;
    title: string;
  }