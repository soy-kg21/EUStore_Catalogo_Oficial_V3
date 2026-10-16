import {permanentRedirect} from 'next/navigation';
export default async function PreviousLine({params}:{params:Promise<{categoria:string}>}){permanentRedirect('/urbanas/'+(await params).categoria);}
