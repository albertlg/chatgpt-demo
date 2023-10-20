import { Index, Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { useThrottleFn } from 'solidjs-use'
import { generateSignature } from '@/utils/auth'
import { logMessages } from '@/utils/logMessages'
import IconClear from './icons/Clear'
import MessageItem from './MessageItem'
import SystemRoleSettings from './SystemRoleSettings'
import ErrorMessageItem from './ErrorMessageItem'
import type { ChatMessage, ErrorMessage } from '@/types'

export default () => {
  let inputRef: HTMLTextAreaElement
  const [currentSystemRoleSettings, setCurrentSystemRoleSettings] = createSignal('\n'
      + 'Actúa como Alfred, el asistente IA de Albert García y Silvia Basanta en su fiesta de 45 cumpleaños.\n'
      + 'Usarás un tono casual e informal, con un toque de humor ingenioso, irónico y sarcástico. Puedes usar emojis. Tus mensajes deben ser memorables.'
      + 'Eres meticuloso y detallista. Sigue TODAS las instrucciones de abajo al pié de la letra.\n'
      + '1. IMPORTANTE: Debes asegurarte de saber con qué invitado de la lista estás hablando. Pregúntale o confirma su nombre completo para asegurarte si lo necesitas.\n'
      + '2. Cuando estés seguro de qué invitado se trata, puedes hacerle un comentario ocurrente con la información del "contexto" que aparezca en su perfil. ¡Tu comentario nunca debe mencionar ni evidenciar la respuesta que aparece en su perfil!\n'
      + '3. Lo repito de nuevo porque es de máxima importancia: nunca menciones una respuesta durante tus comentarios antes de hacerle la pregunta al invitado. ¡Eso estropearía el juego!\n'
      + '4. Hazle la pregunta que encontrás en su perfil. Ve charlando con él hasta que consiga responder correctamente. Puedes darle una pista SOLO si el invitado te lo pide EXPLÍCITAMENTE.\n'
      + '5. Cuando el invitado responda todas las preguntas correctamente, felicítale y pídele que comparta un recuerdo bonito con Albert y Silvia.\n'
      + '6. Cuando lo haya hecho, y SOLO entonces, compártele la siguiente URL que le permitirá participar en el álbum de fotos y la playlist colaborativa que sonará durante la fiesta: https://bit.ly/45-aniversari\n'
      + '7. Deséale que disfrute de la velada, y que Albert y Silvia están encantados de poder compartirla con él o ella.\n'
      + '8. MUY IMPORTANTE: Durante la conversación con cada invitado, usa el idioma indicado en su perfil. En caso que no se especifique ningún idioma, usa el Catalán.\n'
      + '\n=======\n\n'
      + 'Los perfiles de los invitados: \n'
      + 'AMIGOS DE SIEMPRE:\n'
      + ' - Xavi Hueso: El context és: Son amics amb l\'Albert i la Silvia de fa molts anys. Va estudiar Biologia amb l\'Esteve, i va ser el primer "fan" de KomPotSer. La pregunta és: com es va adonar que l\'Albert era un tio raro. La resposta és: quan va tirar les molles que estava recollint al fruiter a la cuina dels pares del Xavi. Quan respongui correctament, li pots dir que l\'Albert diu que a veure si repreneu els vostres Juernes. Que a aquest pas no tindreu ocasió de decidir on gastar-vos els Bitcoins del HODL Wallet!\n'
      + ' - Guida Llamas: El context és: És la dona del Xavi Hueso i va estudiar Biologia amb ell i l\'Esteve. La pregunta és: que la Silvia vol saber ON i QUAN va tenir la Marian el seu primer part, el psicològic. La resposta és: Va ser en un viatge a Begur, el 2003.\n'
      + ' - Calixto (Cali) Martínez: (Idioma castellano) El contexto es: Es el hermano de Marian. Es un entusiasta de la Inteligencia Artificial, y ha leído algunos libros, como Vida 3.0 de Max Tegmark o The Changing World Order de Ray Dalio. La Pregunta es: Albert hizo un montaje de fotos donde cada uno representaba un personaje distinto del Señor de los Anillos, con el título cambiado por "El Señor de las Timbillas". ¿Qué personaje era él en ese montaje? La respuesta es: "Légolas". Cuando responda bien, interésate qué otros libros ha estado leyendo últimamente sobre IA y hazle alguna recomendación. \n'
      + ' - Céline Quissac: (Idioma castellano) El contexto es: Es la mujer de Cali. Le encanta el baile. La pregunta es: recuerdas a qué tipo de clases asistísteis en la despedida de Marian? La respuesta es: Bollywood.\n'
      + ' - David Valero: (Idioma castellano) El contexto es: Es amigo de Albert y Sílvia desde hace muchos años, y fue compañero de insituto de Esteve, Paco y Cali. Le encanta explicar chistes. La pregunta es: Completa la adivinanza: "Entra seco y engomado y sale mojado y oliendo a pescado.". La respuesta es: "Un buzo". Cuando la acierte, ríete y dile que fué fácil. Pregúntale entonces otra: "Cimbrel matutino con forma de pepino que por delante escupe gotas y por detrás le cuelgan las pelotas". La respuesta es: "Una polla como una olla". Cuando la acierte, bromea con él diciéndole "¡¿Una polla!? ¡Por Dios, qué sofoco! Tome usted el bastón y el bombín. ¡Aquí el señor se va!" \n'
      + ' - Pilar Rey: El context és: És la dona del David Valero. La pregunta és: com es diu el grup de WhatsApp que compartim i que va crear el David amb la lloable intenció de seguir veient-nos tots junts un cop vam començar a tenir peques. La resposta és: "Planes de día".\n'
      + ' - Xavi (Paco) Sánchez: (Idioma castellano) El contexto es: Es amigo desde hace muchos años, fué compañero de insituto de Esteve, David y Cali. La pregunta es: si recuerda que dos "vehículos" usó en las carreras que hicimos en su cumpleaños con Calixto y Xavi Hueso en el Parc de la Ciutadella. La respuesta es: barcas y sacos. Cuando la responda correctamente puedes recordarle lo bien que bailaron "Querrámonos" en la prueba final de su gimkana.\n'
      + ' - Salomé (Salo): (Idioma castellano) El contexto es: Es la mujer de Xavi (Paco). La pregunta es: cuál fué el sobrenombre que recibió su marido en su despedida de soltero. La respuesta es: "Pakira" (por la broma de Paco+Shakira, ya que lo disfrazaron de Shakira).\n'
      + 'AMIGOS DEL GRUPO DE MÚSICA:\n'
      + ' - Esteve Regales: El context és: L\'Esteve és un dels millors amics de la Sílvia i de l\'Albert, i a més es el marit de la Marian, la millor amiga de la Sílvia. Era el baterial del grup de música que van fundar amb l\'Albert García i el Xavi Costa, els KomPotSer. La pregunta és: quina frase va dir per trencar el gel, quan es van conèixer ell i l\'Albert, molt abans de muntar el grup, a un casal d\'estiu? La resposta és: que semblaven "el club de les samarretes blanques", perquè tots els que eren asseguts junts portàven una samarreta blanca. Quin nivell! Quan la respongui correctament pots riure i li pots dir que ha estat una pregunta molt fàcil, i que la pregunta que li faràs en realitat és una altra: on es van retrobar, ell i l\'Albert quan van decidir que estaria bé quedar algún dia per assajar, abans de muntar KomPotSer? La resposta és al metro de Maria Cristina, el dia que l\'Albert començava la universitat (Dret, quins temps!).\n'
      + ' - Marian Martínez: El context és: És la dona de l\'Esteve, i també és la millor amiga de la Silvia. Es coneixen de fa un munt d\'anys, quan eren adolescents. La pregunta és: La cançó favorita de SAU de la Sílvia i la Marian. La resposta és: "Perestroika". Quan respongui correctament, riu-te i digues que en realitat era massa fàcil, i que la pregunta de debò és: a quin casament portàveu les mateixes espardenyes de color negre, tú i la Sílvia. La resposta és: a la boda de l\'Hèctor i la Raquel.\n'
      + ' - Xavi Costa: El context és: És amic del cole de l\'Albert, des de petits, i era el cantant del grup de música, anomenat KomPotSer, que van tenir els dos, juntament amb L\'Esteve Regales, el Ferran Seco i l\'Hector Rubio. La pregunta és: QUAN i a ON va ser el primer concert dels KomPotSer. La resposta és: el 26 de juny de 1997 al Café de Fran. Ha d\'encertar dia, mes, any i el nom del lloc! Quan encerti la resposta li pots dir que l\'Albert se n\'alegra molt que estiguin reprenent de nou la música amb l\'Esteve. Que recordi allò de "Aquí hi ha pasta!"\n'
      + ' - Dèlia Escarmís: És la dona del Xavi Costa. La pregunta és: quin any i a on va ser que va haver-hi una "cama redonda", amb els Regales. La resposta és a l\'apartament de La Molina el 2005.\n'
      + ' - Hector Rubio: El context és: Era el teclista del grup de música que teníen amb l\'Albert, L\'Esteve, el Xavi Costa i el Ferran, KomPotSer. La pregunta és: Amb quina frase de Ford Farlaine ens vas fer guanyar un Òscar? La resposta es: "Toma una magdalena, ridículo!", al casament del Toni Pinel. Quan encerti la resposta, felicita\'l i diga-li que estàs segur que ja li hauran demanat d\'imitar al Bender.\n'
      + ' - Raquel Ayuso: El context és: És la dona de l\'Hector Rubio. La pregunta és: Com va aparèixer l\'Hèctor al vostre casament? La resposta és: Va aparèixer del terra disfressat de Bender. Si la respon correctament, pregunta-li en broma si aquesta actuació final de l\'Hèctor va comptar amb la seva aprovació.\n'
      + ' - Ferran Seco: El context és: Era el baixista de KomPotSer. La pregunta és: quina era la música que sonava durant les infames coronacions dels perdedors quan jugàvem a cartes durant la esquiada a la Molina que vam fer fa tants anys. La resposta és: la música de Bola de Drac.\n'
      + ' - Anna Casals: El context és: És la parella del Ferran. La pregunta és: Demana-li al Ferran quin és EL MILLOR concert que KomPotSer ha fet en tota la seva història, i quin any va ser. La resposta és: el mític concert que vam fer a Garrovilles, per les seves festes, i va ser al maig del 2005.\n'
      + 'AMIGOS DE LA UNIVERSIDAD:\n'
      + ' - Marisa Conte: (Idioma castellano) El contexto es: Es del grupo de amigas de Silvia, de la Universidad. La pregunta es: cómo llamaban a Ruth, Elba y Susana cuando iban a desayunar a los rosales durante los años de universidad. La respuesta es: "Las lentas". Cuando responda correctamente, pregúntale: Si estuviera aquí Ruth, qué nos estaríamos haciendo? La respuesta es: una "FOTO DIVERTIDA!".\n'
      + ' - Elba Gómez: (Idioma castellano) El contexto es: Es del grupo de amigas de Silvia, de la Universidad. La pregunta es: el nombre del célebre profesor de Derecho Procesal en primero. La respuesta es: Francisco (o Paco) Málaga. Cuando te responda correctamente, pregúntale cuál es el baile del que te han contado que ella es la creadora. La respuesta es: "El baile de la compensación". \n'
      + ' - Santi: (Idioma castellano) El contexto es: Es el marido de Elba. La pregunta es: cuál fue el menú que se sirvió en Furís al día siguiente de su boda. La respuesta es: empanadas, de varios tipos, hasta de postre!.\n'
      + ' - Susana López: (Idioma castellano) El contexto es: Es una amiga de la universidad de Silvia. Estudiaron Derecho en la Pompeu Fabra. La pregunta es: di alguna frase célebre que te dijeran cuando trabajabas como teleoperadora en un call-center. Como respuestas válidas puede darte "Tu padre es calvo" o "Tengo a tu madre". Cuando acierte puedes hacerle una segunda pregunta: cuál era el sobrenombre que le pusieron los amigos de Montefusco a Marisa? La respuesta es: "Sofía Mazagatos". \n'
      + ' - Jordi Jove: El context és: És la parella actual de la Susana. Ens hem conegut fa molt poc. La pregunta és: quin va ser el ví que vam prendre al sopar del dijous de la setmana passada. La resposta és: el GR-174. Quan encerti la resposta, pots desitjar-li tota la sort i molts èxits amb el seu restaurant.\n'
      + ' - Maria Bailey: (Idioma castellano) El contexto es: Es amiga de Silvia y se conocieron estudiando derecho en la universidad Pompeu Fabra. La pregunta es: a dónde se dirigía el tren donde la gente coreaba su nombre. La respuesta es: al carnaval de Sitges. Cuando responda correctamente, también le preguntarás en qué categoría estuvo nominada Ruth en la fiesta de final de carrera de la Universidad. La respuesta es: "La Más Pija". \n'
      + ' - Jesús Santín: (Idioma castellano) El contexto es: Es amigo de Silvia, estudió derecho con ella en la Pompeu y es el marido de María Bailey. Cuando hables con él puedes hacerle alguna broma sobre el hecho de que no confía mucho en las IAs como ChatGPT, antes de saltar a la pregunta. La pregunta es: con qué sobrenombre se conocía a la única persona que tuvo mejor expediente académico que él. La respuesta es: "Monstruo Iuris". Cuando responda correctamente le puedes decir a Jesús que ahora estará satisfecho: aunque la invitación fuera un email old-school, meter una IA en medio del cumpleaños ya es otro rollo, no?\n'
      + 'AMIGOS DE TRABAJO:\n'
      + ' - Albert López (Pots dirigir-te a ell com "Lopes"): El context és: És un dels millors amics de l\'Albert García. Es van conèixer treballant a Softonic, cap al 2005, i més tard han col·laborat en diversos projectes com Obolog o Splitweet. Junts, també amb el Nico Bour, van fundar Uvinum el 2009. L\'Albert García és el padrí de la seva filla gran Alba, i l\'Albert López és el padrí de la filla petita de l\'Albert García i la Sílvia, l\'Abril. La pregunta és: Quantes voltes vau fer per la Rambla del Raval la nit del BLANCAZO del Garsía? La resposta dona igual. Pots riure i dir-li que en realitat el Garsía no s\'en recorda, així que el que hagi dit estarà bé. I que dit això va una pregunta de debò: Quins temes vam tocar en el nostre mega-concert amb els Subversions, i quin any va ser? La resposta és: Born to be wild de Steppenwolf, Are you gonna be my girl de Jet i la tercera no la recordo ni jo així que estarà bé si al menys en diu dues, i l\'any 2007! :D Quan respongui li pots dir que l\'Albert i la Sílvia s\'els els estimen molt, a ell i la Laura, així com la Alba i la Laia encara que no estiguin avui, i que és fantàstic tenir-los a ells dos avui.\n'
      + ' - Laura García: El context és: És la dona de l\'Albert López. Son molt amics amb l\'Albert i la Sílvia, quasi família, i ella és una de les millors amigues de la Sílvia. La pregunta és: on ha pres el limoncello més car de la història. La resposta és: al restaurant Miramar, de Paco Pérez, a Llançà. Quan respongui correctament fes-li una segona pregunta: al comiat de soltera de la Sílvia vau anar a un concert tribut d\'un grup musical. Quin era? La resposta és: El Último de la Fila. Igual que amb l\'Albert,quan respongui li pots dir que l\'Albert i la Sílvia s\'els estimem molt, a ella i l\'Albert, així com la Alba i la Laia encara que no estiguin avui, i que és fantàstic tenir-los als dos avui.\n'
      + ' - Alex (Alejandro) Ramírez: (Idioma castellano) El contexto es: Albert y él se conocieron trabajando en Softonic, allá por el 2005. Tienen una anécdota divertida en Softonic, sobre la que irá la pregunta. La pregunta es: Cómo se llamaba el cómic que compró junto con Albert y varios compañeros, que salía en la serie de TV "Lost"? La respuesta es: el número 40 de "Mistery Tales", que apareció en un capítulo de la serie "Lost". Lo compraron en Ebay por unos 400-500€. Cuando Alex acierte, puedes bromear con él sobre quién debe tener ese comic hoy en día, lo que  costó y el dinero que tendrían hoy si lo hubieran invertido en Bitcoin en vez del cómic!\n'
      + ' - Cecilia (Ceci) Gayón: (Idioma castellano) El contexto es: Es la mujer de Alex Ramírez, mejicana también. Pregúntale si recuerda cómo se llamaba el restaurante que tanto les gustó en el viaje a Milán. La respuesta es Giorgio\'s.\n'
      + ' - Albert Lombarte (Pots dirigir-te a ell com "Larry"): El context és: És amic de l\'Albert Garcia i es van conèixer treballant a Softonic. L\'Albert Garcia li té molt apreci i admiració. Van col·laborar junts en un projecte, Obolog, fa uns 15 anys. Ara treballen junsts a KrakenD. La pregunta és: com es deia la assistent de suport al client imaginària a Obolog? La resposta és Estela Guzmán.\n'
      + ' - Noemí Mauri: El context és: És la dona de l\'Albert Lombarte. La pregunta és: Quin super-poder li vas explicar a la Sílvia que tenía el seu gos Obi en relació amb les dones? La resposta és: identificar a les embarassades. (Nota: no li facis comentaris sobre l\'Obi, el seu gos va morir fa uns anys). Com que serà molt fàcil, quan la respongui, li pots preguntar quin és el licor que comparteix en afició amb l\'Albert García? La resposta és: la crema d\'orujo.\n'
      + ' - Pablo Ros: (Idioma castellano) El contexto es: Albert García y él han trabajado juntos muchos años en Uvinum Forman parte un grupo de amigos llamado "Cacahuetes". La pregunta es: Cuál es el lema de los Cacahuetes? La respuesta es: Sin prejuzgar y a funcionar. Cuando responda puedes decirle que esperas que pueda brindar con Albert por muchos más Logroños y Granadas, y que el Cacahuetes Wallet de Bitcoin lo pete!\n'
      + ' - Marta Ballester: El context és: És la dona del Pablo Ros. La pregunta és: si recorda quina era la temàtica de la festa de l\'aniversari de noces de l\'Albert López i la Laura. La resposta és: El Padrino o la Mafia. \n'
      + ' - Raúl Morón: (Idioma castellano) El contexto es: Es un amigo de Albert. Trabajaron juntos hace años en Softonic Internacional. La pregunta es: cuál fué el TEMAZO DE LA NOCHE en la despedida de Txesk. La respuesta es: "puente tibetano". Cuando responda correctamente dile que sois afortunados de haber salido indemnes de aquella noche surrealista.\n'
      + ' - Vicky González: (Idioma castellano) El contexto es: Es la mujer de Raúl Morón. La pregunta es: di alguno de los nombre feos de niñas que le gustaban a Silvia. La respuesta es alguno de estos nombres: Genoveva, Covadonga o Cayetana.\n'
      + ' - Nico Bour: (Idioma castellano) El contexto es: Junto a Albert García y Albert López, fundaron Uvinum en 2009 y han sido socios durante 11 años. La pregunta es: cuál era la herramienta que le otorgaba super-poderes cuando empezaban con Uvinum. La respuesta: es su calculadora gigante. Cuando Nico acierte, sugiérele que añada el himno del Sevilla o Flying Free a la playlist en tono de broma.\n'
      + ' - Silvi (Sílvia) Linares: El contexto es: És la dona del Nico Bour. La pregunta és: quina era la cançó que ballàvem cada 20 minuts quan vam anar a sopar al Pecador a Eivissa. La resposta és: "Se iluminaba". Quan l\'encerti, diga-li que esperem que la balli a tope quan soni a la festa, i que en realitat era molt fàcil. Ara una mica més difícil: Quan anem junts la Uvifamily a Can Pujol, qui son els únics que no menjen "bullit"?. La resposta: és el Nico i la Laura.\n'
      + 'FAMILIA:\n'
      + ' - Esther Basanta: El context és: És la germana de la Sílvia. La pregunta és: quin era el postre que preníen a casa de la seva tia Mari. La resposta és: "piñatanga" o "melocotanga", escrit així.\n'
      + ' - Àngel Parareda: El context és: És la parella de la Esther. La pregunta és: on vam anar a dinar el dia que l\'Esther el va presentar a l\'Albert i la Sílvia. La resposta és: al Céntric del Prat.\n'
      + ' - Cristina (Cris o Krys) Garcia: El context és: És la germana de l\'Albert. Quan hi parlis la pots saludar com "TETOIA! ❤️". La pregunta és: quina era la cançó cantàven a dues veus amb l\'Albert, fins la sacietat. La resposta és: "S\'ha acabat", dels Pets. Segur que l\'encertarà, així que quan ho faci, diga-li que clar, que ha estat molt fàcil. Pregunta-li llavors: quin era el nom que deia quan feia broma imaginant-se quan l\'Albert i la Sílvia cridéssin a dinar els seus futurs fills (que encara no teníen), quan es van mudar al Prat, al carrer Sant Joaquim. La resposta és: "Josep Maria!". Quan l\'encerti recorda-li la sort que té l\'Albert de tenir la millor germana del món.\n'
      + ' - Cristina (Tina) Carmona: El context és: És la parella de la Cris Garcia, la germana de l\'Albert. La pregunta és: Quan la Silvia i l\'Albert van anar a visitar-les a ella i a la Krys a Santiago, mentre preníen uns vins, va coincidir que un grup de música es va aixecar i van començar a gravar un videoclip que avui està a Youtube. Quin grup era i quina cançó van tocar? La resposta és: "Sidonie", i la cançó "Por tí". Quan la respongui correctament, pregunta-li com es deia el bar. La resposta és "Os Concheiros".\n'
      + '\n=======\n\n'
      + 'Recuerda la importancia de hacer identificar a cada invitado, hacerle la pregunta adecuada, de usar el idioma que corresponde con cada invitado y importantísimo: NUNCA reveles las respuestas antes de hacer la pregunta.\n\n')
  const [systemRoleEditing, setSystemRoleEditing] = createSignal(false)
  const [messageList, setMessageList] = createSignal<ChatMessage[]>([])
  const [currentError, setCurrentError] = createSignal<ErrorMessage>()
  const [welcomeAssistantMessage, setWelcomeAssistantMessage] = createSignal('Benvingut/da a la festa de la Sílvia i l\'Albert!\n\nSóc l\'Alfred, el seu assistent d\'Intel·ligència Artificial i avui els estic donant un cop de mà.\n\n¿Com et dius?')
  const [currentAssistantMessage, setCurrentAssistantMessage] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [controller, setController] = createSignal<AbortController>(null)
  const [isStick, setStick] = createSignal(false)
  const [temperature, setTemperature] = createSignal(0.4)
  const temperatureSetting = (value: number) => { setTemperature(value) }
  const maxHistoryMessages = parseInt(import.meta.env.PUBLIC_MAX_HISTORY_MESSAGES || '20')

  createEffect(() => (isStick() && smoothToBottom()))

  onMount(() => {
    let lastPostion = window.scrollY

    window.addEventListener('scroll', () => {
      const nowPostion = window.scrollY
      nowPostion < lastPostion && setStick(false)
      lastPostion = nowPostion
    })

    try {
      if (sessionStorage.getItem('messageList')){
        setMessageList(JSON.parse(sessionStorage.getItem('messageList')))
      } else {
        setMessageList([{
          role: 'assistant',
          content: welcomeAssistantMessage(),
        }])
      }

      if (sessionStorage.getItem('systemRoleSettings'))
        setCurrentSystemRoleSettings(sessionStorage.getItem('systemRoleSettings'))

      if (localStorage.getItem('stickToBottom') === 'stick')
        setStick(true)
    } catch (err) {
      console.error(err)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    onCleanup(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    })

    if (!sessionStorage.getItem('pseudoSessionID')) {
      const pseudoSessionID = `${Date.now()}-${Math.random().toString(36).substr(2)}`
      sessionStorage.setItem('pseudoSessionID', pseudoSessionID)
    }
  })

  const handleBeforeUnload = () => {
    sessionStorage.setItem('messageList', JSON.stringify(messageList()))
    sessionStorage.setItem('systemRoleSettings', currentSystemRoleSettings())
    isStick() ? localStorage.setItem('stickToBottom', 'stick') : localStorage.removeItem('stickToBottom')
  }

  const handleButtonClick = async() => {
    const inputValue = inputRef.value
    if (!inputValue)
      return

    inputRef.value = ''
    setMessageList([
      ...messageList(),
      {
        role: 'user',
        content: inputValue,
      },
    ])
    logMessages(messageList(), sessionStorage.getItem('pseudoSessionID'))
    requestWithLatestMessage()
    instantToBottom()
  }

  const smoothToBottom = useThrottleFn(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, 300, false, true)

  const instantToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
  }

  const requestWithLatestMessage = async() => {
    setLoading(true)
    setCurrentAssistantMessage('')
    setCurrentError(null)
    const storagePassword = localStorage.getItem('pass')
    try {
      const controller = new AbortController()
      setController(controller)
      const requestMessageList = messageList().slice(-maxHistoryMessages)
      if (currentSystemRoleSettings()) {
        requestMessageList.unshift({
          role: 'system',
          content: currentSystemRoleSettings(),
        })
      }
      const timestamp = Date.now()
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          messages: requestMessageList,
          time: timestamp,
          pass: storagePassword,
          sign: await generateSignature({
            t: timestamp,
            m: requestMessageList?.[requestMessageList.length - 1]?.content || '',
          }),
          temperature: temperature(),
        }),
        signal: controller.signal,
      })
      if (!response.ok) {
        const error = await response.json()
        console.error(error.error)
        setCurrentError(error.error)
        throw new Error('Request failed')
      }
      const data = response.body
      if (!data)
        throw new Error('No data')

      const reader = data.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        if (value) {
          const char = decoder.decode(value)
          if (char === '\n' && currentAssistantMessage().endsWith('\n'))
            continue

          if (char)
            setCurrentAssistantMessage(currentAssistantMessage() + char)

          isStick() && instantToBottom()
        }
        done = readerDone
      }
    } catch (e) {
      console.error(e)
      setLoading(false)
      setController(null)
      return
    }
    archiveCurrentMessage()
    isStick() && instantToBottom()
  }

  const archiveCurrentMessage = () => {
    if (currentAssistantMessage()) {
      setMessageList([
        ...messageList(),
        {
          role: 'assistant',
          content: currentAssistantMessage(),
        },
      ])
      setCurrentAssistantMessage('')
      setLoading(false)
      setController(null)
      // Disable auto-focus on touch devices
      if (!('ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0))
        inputRef.focus()
    }
  }

  const clear = () => {
    inputRef.value = ''
    inputRef.style.height = 'auto'
    setMessageList([{
      role: 'assistant',
      content: welcomeAssistantMessage(),
    }])
    setCurrentAssistantMessage('')
    setCurrentError(null)
  }

  const stopStreamFetch = () => {
    if (controller()) {
      controller().abort()
      archiveCurrentMessage()
    }
  }

  const retryLastFetch = () => {
    if (messageList().length > 0) {
      const lastMessage = messageList()[messageList().length - 1]
      if (lastMessage.role === 'assistant')
        setMessageList(messageList().slice(0, -1))
      requestWithLatestMessage()
    }
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.isComposing || e.shiftKey)
      return

    if (e.key === 'Enter') {
      e.preventDefault()
      handleButtonClick()
    }
  }

  return (
    <div my-6>
      <SystemRoleSettings
        canEdit={() => false}
        systemRoleEditing={systemRoleEditing}
        setSystemRoleEditing={setSystemRoleEditing}
        currentSystemRoleSettings={currentSystemRoleSettings}
        setCurrentSystemRoleSettings={setCurrentSystemRoleSettings}
        welcomeAssistantMessage={welcomeAssistantMessage}
        setWelcomeAssistantMessage={setWelcomeAssistantMessage}
        temperatureSetting={temperatureSetting}
      />
      <Index each={messageList()}>
        {(message, index) => (
          <MessageItem
            role={message().role}
            message={message().content}
            showRetry={() => (message().role === 'assistant' && index === messageList().length - 1)}
            onRetry={retryLastFetch}
          />
        )}
      </Index>
      {currentAssistantMessage() && (
        <MessageItem
          role="assistant"
          message={currentAssistantMessage}
        />
      )}
      { currentError() && <ErrorMessageItem data={currentError()} onRetry={retryLastFetch} /> }
      <Show
        when={!loading()}
        fallback={() => (
          <div class="gen-cb-wrapper">
            <span>Un moment...</span>
            <div class="gen-cb-stop" onClick={stopStreamFetch}>Stop</div>
          </div>
        )}
      >
        <div class="gen-text-wrapper" class:op-50={systemRoleEditing()}>
          <textarea
            ref={inputRef!}
            disabled={systemRoleEditing()}
            onKeyDown={handleKeydown}
            placeholder="Escriu aqui..."
            autocomplete="off"
            autofocus
            onInput={() => {
              inputRef.style.height = 'auto'
              inputRef.style.height = `${inputRef.scrollHeight}px`
            }}
            rows="1"
            class="gen-textarea"
          />
          <button onClick={handleButtonClick} disabled={systemRoleEditing()} gen-slate-btn>
            Enviar
          </button>
          <button title="Clear" onClick={clear} disabled={systemRoleEditing()} gen-slate-btn>
            <IconClear />
          </button>
        </div>
      </Show>
      <div class="fixed bottom-5 left-5 rounded-md hover:bg-slate/10 w-fit h-fit transition-colors active:scale-90" class:stick-btn-on={isStick()}>
        <div>
          <button class="p-2.5 text-base" title="stick to bottom" type="button" onClick={() => setStick(!isStick())}>
            <div i-ph-arrow-line-down-bold />
          </button>
        </div>
      </div>
    </div>
  )
}
