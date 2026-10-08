import pdfRobotica from '../assets/certificados/Certificado_robotica.pdf';
import imgRobotica from '../assets/images/Certificado_robotica.png';
import pdfWeMakeSoftware from '../assets/certificados/Certificado-Wemakesoftware1.pdf';
import imgWeMakeSoftware from '../assets/images/Certificado-Wemakesoftware1.png';
import pdfDestaqueSesi from '../assets/Certificados/Aluno_Destaque_SESI_1_2_3_ano.pdf';
import imgDestaqueSesi from '../assets/images/Certificado_sesi.png';
import pdfSenai from '../assets/Certificados/Senai.pdf';
import imgSenai from '../assets/images/Senai.png';
export const certificados = [
    {
    id: 'fll',
    nome: 'Torneio SESI de Robótica- First Lego League (FLL)',
    instituicao: 'SESI Alvimar Carneiro de Rezende',
    data: '2023',
    arquivo: pdfRobotica,
    previa: imgRobotica,
    },
    {
    id:'We Make Software-Estagi.ON',
    nome: 'We Make Software-2026/1',
    instituicao: 'Pontifícia Universidade Católica de Minas Gerais',
    data: '2026',
    arquivo: pdfWeMakeSoftware,
    previa: imgWeMakeSoftware,
    },
    {
        id: 'aluno-destaque',
        nome: 'Aluno Destaque — 1º ao 3º ano do Ensino Médio',
        instituicao: 'SESI Alvimar Carneiro de Rezende',
        data: '2023 — 2025',
        arquivo: pdfDestaqueSesi,
        previa: imgDestaqueSesi,
    },
    {
        id: 'senai',
        nome: 'Curso Profissionalizante de Manutenção de Máquinas Industriais',
        instituicao: 'SENAI',
        data: '2024',
        arquivo: pdfSenai,
        previa: imgSenai,
    }
]
