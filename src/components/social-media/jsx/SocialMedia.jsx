import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
export default function SocialMedia({navigate}) {return <ModulePage module={getModule("social-media")} navigate={navigate}/>;}
