export type AcademiaPerson = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
  imageAlt: string;
};

/** Perfiles estáticos de Academia (sin admin). */
export const ACADEMIA_PEOPLE: AcademiaPerson[] = [
  {
    id: "jose-jimenez",
    name: "José Jiménez",
    role: "Creador y educador",
    bio: "Cuenta con 11 años de experiencia en gastronomía y 7 años de especialización en café, trabajando en tueste, control de calidad, servicio y formación. Es profesional certificado por la SCA en análisis sensorial y filtrados, y desde hace 2 años se desempeña como educador de baristas.",
    imageSrc: "/images/academia/jose-jimenez.jpg",
    imageAlt: "José Jiménez",
  },
  {
    id: "yuruan-silva",
    name: "Yuruan Silva",
    role: "Creador y formador",
    bio: "10 años de experiencia en café de especialidad y 2 años formando baristas. Un recorrido que combina práctica, formación técnica y una mirada integral sobre el café, desde el grano hasta la taza.",
    imageSrc: "/images/academia/yuruan-silva.jpg",
    imageAlt: "Yuruan Silva",
  },
  {
    id: "fernanda-romay",
    name: "Fernanda Romay",
    role: "Creadora y tostadora",
    bio: "Tostadora, barista y Administradora Agraria. Hace 7 años se formó en el mundo del café de especialidad y hoy su recorrido se concentra especialmente en el origen, el café verde y el tueste. Desde Orí, combina esa mirada con la educación para acercar a otros todo lo que sucede detrás de una taza.",
    imageSrc: "/images/academia/fernanda-romay.jpg",
    imageAlt: "Fernanda Romay",
  },
];
