import Home from "@/pages/Home"
import RedeAvaluz from "@/pages/RedeAvaluz"
import AvaliarImovel from "@/pages/AvaliarImovel"
import AvaliacaoDetalhes from "@/pages/AvaliacaoDetalhes"
import BuscarImoveis from "@/pages/BuscarImoveis"
import Historico from "@/pages/Historico"
import Creditos from "@/pages/Creditos"
import Conquistas from "@/pages/Conquistas"
import Assinatura from "@/pages/Assinatura"
import Configuracoes from "@/pages/Configuracoes"
import Ajuda from "@/pages/Ajuda"
import Tutorial from "@/pages/Tutorial"
import TutorialAvaluz from "@/pages/TutorialAvaluz"
import Noticiario from "@/pages/Noticiario"
import SignIn from "@/pages/SignIn"
import SignUp from "@/pages/Signup"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import PaymentSuccess from "@/pages/PaymentSuccess"
import NotFound from "@/pages/NotFound"
import AcceptInvite from "@/pages/AcceptInvite"
import TeamHome from "@/pages/Time/TeamHome"
import TeamMembers from "@/pages/Time/TeamMembers"
import TeamCredits from "@/pages/Time/TeamCredits"
import TeamSettings from "@/pages/Time/TeamSettings"
import TeamHistory from "@/pages/Time/TeamHistory"
import TeamAnalytics from "@/pages/Time/TeamAnalytics"
import TeamTraining from "@/pages/Time/TeamTraining"
import TeamMemberProfile from "@/pages/Time/TeamMemberProfile"
import TeamAchievements from "@/pages/Time/TeamAchievements"
import TeamCalendar from "@/pages/Time/TeamCalendar"
import TeamReport from "@/pages/Time/TeamReport"

import RemaxOnboarding from "@/pages/Remax/RemaxOnboarding"
import RemaxPending from "@/pages/Remax/RemaxPending"
import MfrHome from "@/pages/Mfr/MfrHome"
import MfrFranchises from "@/pages/Mfr/MfrFranchises"
import MfrRankings from "@/pages/Mfr/MfrRankings"
import MfrHeatmap from "@/pages/Mfr/MfrHeatmap"

import CeoHome from "@/pages/Ceo/CeoHome"
import CeoNetwork from "@/pages/Ceo/CeoNetwork"
import CeoRankings from "@/pages/Ceo/CeoRankings"
import CeoHeatmap from "@/pages/Ceo/CeoHeatmap"
import CeoAgenda from "@/pages/Ceo/CeoAgenda"

import TestPdf from "@/pages/TestPdf"
import PrintPreview from "@/pages/PrintPreview"
import { createBrowserRouter, Navigate } from "react-router-dom"
import { TenantRoute } from "@/components/auth/TenantRoute"
import { MfrRoute } from "@/components/auth/MfrRoute"
import { CeoRoute } from "@/components/auth/CeoRoute"
import { RootLayout } from "@/components/RootLayout"

/**
 * AvaMax routes — single-tenant, served at the root (no `/remax` namespace).
 *
 * The monorepo mirrored every AvaLuz route under `/remax/*`. In the separated
 * AvaMax app the tenant IS the app, so the standard member routes live at root.
 * MFR and CEO are role hierarchies within the tenant and keep their own
 * sub-namespaces (`/mfr/*`, `/ceo/*`).
 */
export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                path: "/",
                element: <Navigate to="/auth/signin" replace />,
            },
            {
                path: "/auth/signin",
                element: <SignIn />,
            },
            {
                path: "/auth/signup",
                element: <SignUp />,
            },
            {
                path: "/auth/forgot-password",
                element: <ForgotPassword />,
            },
            {
                path: "/auth/reset-password",
                element: <ResetPassword />,
            },
            {
                path: "/auth/accept-invite",
                element: <AcceptInvite />,
            },
            // Onboarding / pending — accessible before full tenant access
            {
                path: "/onboarding",
                element: (
                    <TenantRoute title="Onboarding" guard="bare">
                        <RemaxOnboarding />
                    </TenantRoute>
                ),
            },
            {
                path: "/pending",
                element: (
                    <TenantRoute title="Aguardando aprovação" guard="bare">
                        <RemaxPending />
                    </TenantRoute>
                ),
            },
            // Member routes (require onboarding + team membership + tenant theme)
            {
                path: "/home",
                element: (
                    <TenantRoute title="Dashboard">
                        <Home />
                    </TenantRoute>
                ),
            },
            {
                path: "/rede",
                element: (
                    <TenantRoute title="Rede Avaluz">
                        <RedeAvaluz />
                    </TenantRoute>
                ),
            },
            {
                path: "/avaliar",
                element: (
                    <TenantRoute title="Avaliar Imóvel">
                        <AvaliarImovel />
                    </TenantRoute>
                ),
            },
            {
                path: "/buscar-imoveis",
                element: (
                    <TenantRoute title="Buscar Imóveis">
                        <BuscarImoveis />
                    </TenantRoute>
                ),
            },
            {
                path: "/avaliacao/:id",
                element: (
                    <TenantRoute title="Avaliação">
                        <AvaliacaoDetalhes />
                    </TenantRoute>
                ),
            },
            {
                path: "/historico",
                element: (
                    <TenantRoute title="Histórico">
                        <Historico />
                    </TenantRoute>
                ),
            },
            {
                path: "/creditos",
                element: (
                    <TenantRoute title="Créditos">
                        <Creditos />
                    </TenantRoute>
                ),
            },
            {
                path: "/assinatura",
                element: (
                    <TenantRoute title="Assinatura">
                        <Assinatura />
                    </TenantRoute>
                ),
            },
            {
                path: "/conquistas",
                element: (
                    <TenantRoute title="Conquistas">
                        <Conquistas />
                    </TenantRoute>
                ),
            },
            {
                path: "/configuracoes",
                element: (
                    <TenantRoute title="Configurações">
                        <Configuracoes />
                    </TenantRoute>
                ),
            },
            {
                path: "/ajuda",
                element: (
                    <TenantRoute title="Ajuda">
                        <Ajuda />
                    </TenantRoute>
                ),
            },
            {
                path: "/tutorial",
                element: (
                    <TenantRoute title="Instale o App">
                        <Tutorial />
                    </TenantRoute>
                ),
            },
            {
                path: "/tutorial-avaluz",
                element: (
                    <TenantRoute title="Tutorial AvaLuz">
                        <TutorialAvaluz />
                    </TenantRoute>
                ),
            },
            {
                path: "/noticiario",
                element: (
                    <TenantRoute title="Noticiário">
                        <Noticiario />
                    </TenantRoute>
                ),
            },
            {
                path: "/payment-success",
                element: (
                    <TenantRoute title="Pagamento" guard="bare">
                        <PaymentSuccess />
                    </TenantRoute>
                ),
            },
            // Team routes
            {
                path: "/time",
                element: <TenantRoute title="Time"><Navigate to="/time/home" replace /></TenantRoute>,
            },
            {
                path: "/time/home",
                element: (
                    <TenantRoute title="Meu Time">
                        <TeamHome />
                    </TenantRoute>
                ),
            },
            {
                path: "/time/members",
                element: (
                    <TenantRoute title="Membros">
                        <TeamMembers />
                    </TenantRoute>
                ),
            },
            {
                path: "/time/credits",
                element: (
                    <TenantRoute title="Créditos do Time">
                        <TeamCredits />
                    </TenantRoute>
                ),
            },
            {
                path: "/time/settings",
                element: (
                    <TenantRoute title="Configurações do Time">
                        <TeamSettings />
                    </TenantRoute>
                ),
            },
            {
                path: "/time/history",
                element: (
                    <TenantRoute title="Histórico do Time">
                        <TeamHistory />
                    </TenantRoute>
                ),
            },
            {
                path: "/time/analytics",
                element: (
                    <TenantRoute title="Analytics">
                        <TeamAnalytics />
                    </TenantRoute>
                ),
            },
            {
                path: "/time/training",
                element: (
                    <TenantRoute title="Treinamento">
                        <TeamTraining />
                    </TenantRoute>
                ),
            },
            {
                path: "/time/member/:userId",
                element: (
                    <TenantRoute title="Perfil do Membro">
                        <TeamMemberProfile />
                    </TenantRoute>
                ),
            },
            {
                path: "/time/conquistas",
                element: (
                    <TenantRoute title="Conquistas do Time">
                        <TeamAchievements />
                    </TenantRoute>
                ),
            },
            {
                path: "/time/agenda",
                element: (
                    <TenantRoute title="Agenda do Time">
                        <TeamCalendar />
                    </TenantRoute>
                ),
            },
            {
                path: "/time/report",
                element: (
                    <TenantRoute title="Relatório PDF">
                        <TeamReport />
                    </TenantRoute>
                ),
            },
            // MFR (Master Franqueado) routes
            {
                path: "/mfr",
                element: <MfrRoute title="Dashboard"><Navigate to="/mfr/home" replace /></MfrRoute>,
            },
            {
                path: "/mfr/home",
                element: (
                    <MfrRoute title="Dashboard MFR">
                        <MfrHome />
                    </MfrRoute>
                ),
            },
            {
                path: "/mfr/imobiliarias",
                element: (
                    <MfrRoute title="Imobiliárias">
                        <MfrFranchises />
                    </MfrRoute>
                ),
            },
            {
                path: "/mfr/rankings",
                element: (
                    <MfrRoute title="Rankings">
                        <MfrRankings />
                    </MfrRoute>
                ),
            },
            {
                path: "/mfr/mapa",
                element: (
                    <MfrRoute title="Mapa de Calor">
                        <MfrHeatmap />
                    </MfrRoute>
                ),
            },
            {
                path: "/mfr/avaliar",
                element: (
                    <MfrRoute title="Avaliar Imóvel">
                        <AvaliarImovel />
                    </MfrRoute>
                ),
            },
            {
                path: "/mfr/agenda",
                element: (
                    <MfrRoute title="Agenda">
                        <TeamCalendar />
                    </MfrRoute>
                ),
            },
            {
                path: "/mfr/noticiario",
                element: (
                    <MfrRoute title="Noticiário">
                        <Noticiario />
                    </MfrRoute>
                ),
            },
            {
                path: "/mfr/configuracoes",
                element: (
                    <MfrRoute title="Configurações">
                        <Configuracoes />
                    </MfrRoute>
                ),
            },
            // CEO routes
            {
                path: "/ceo",
                element: <CeoRoute title="Dashboard"><Navigate to="/ceo/home" replace /></CeoRoute>,
            },
            {
                path: "/ceo/home",
                element: (
                    <CeoRoute title="Dashboard CEO">
                        <CeoHome />
                    </CeoRoute>
                ),
            },
            {
                path: "/ceo/rede",
                element: (
                    <CeoRoute title="Rede">
                        <CeoNetwork />
                    </CeoRoute>
                ),
            },
            {
                path: "/ceo/rankings",
                element: (
                    <CeoRoute title="Rankings">
                        <CeoRankings />
                    </CeoRoute>
                ),
            },
            {
                path: "/ceo/mapa",
                element: (
                    <CeoRoute title="Mapa de Calor">
                        <CeoHeatmap />
                    </CeoRoute>
                ),
            },
            {
                path: "/ceo/agenda",
                element: (
                    <CeoRoute title="Agenda">
                        <CeoAgenda />
                    </CeoRoute>
                ),
            },
            {
                path: "/ceo/noticiario",
                element: (
                    <CeoRoute title="Noticiário">
                        <Noticiario />
                    </CeoRoute>
                ),
            },
            {
                path: "/ceo/configuracoes",
                element: (
                    <CeoRoute title="Configurações">
                        <Configuracoes />
                    </CeoRoute>
                ),
            },
            {
                path: "/test-pdf",
                element: <TestPdf />,
            },
            {
                path: "*",
                element: <NotFound />,
            },
        ]
    },
    {
        path: "/print-preview",
        element: <PrintPreview />,
    }
])
