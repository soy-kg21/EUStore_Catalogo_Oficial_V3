import {money} from '@/lib/config';
import {discount} from '@/lib/product-display';
import type {Product} from '@/lib/types';
export default function ProductPrice({product:p}:{product:Product}){const off=discount(p);return <div className="price-stack">{p.pricingPending?<strong>Consultar precio</strong>:<>{off>0&&<span><del>{money(p.previousPrice!)}</del><b className="discount-badge">−{off}%</b></span>}<strong>{money(p.price)} <small>COP</small></strong></>}</div>}
